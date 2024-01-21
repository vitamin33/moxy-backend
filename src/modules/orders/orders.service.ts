import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderedItem, OrderedProduct, Status } from './order.entity';
import mongoose, { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { GuestUserDto as UserDto } from 'src/modules/users/dto/guest-user.dto';
import { UsersService } from 'src/modules/users/users.service';
import { OrderDocument } from './order.entity';
import { User } from 'src/modules/users/user.entity';
import { ChangeOrderDto } from './dto/change-order.dto';
import { FindByDto } from './dto/find-by.dto';
import { ProductsService } from 'src/modules/products/service/products.service';
import { UserNotFoundException } from 'src/common/exception/user-not-found.exception';
import { OrderNotFoundException } from 'src/common/exception/order-not-found.exception';
import { Dimension } from 'src/common/entity/dimension.entity';
import { compareDimensions, convertToDimension } from 'src/common/utility';
import { AttributesWithCategories } from '../attributes/attribute.entity';
import { AttributesService } from '../attributes/attributes.service';
import { DimensionDto } from 'src/common/dto/dimension.dto';
import { ProductNotAvailableException } from 'src/common/exception/product-not-available.exception';
import { ProductWithCostPrice } from '../products/product.entity';

@Injectable()
export class OrdersService {
  private attributes: AttributesWithCategories;
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private usersService: UsersService,
    private productsService: ProductsService,
    private attributesService: AttributesService,
  ) {
    this.initializeAttributes();
  }

  private async initializeAttributes() {
    this.attributes = await this.attributesService.getAttributes();
  }
  async getPaginatedAllOrders(skip: number, limit: number) {
    const orders = await this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .populate(
        'client',
        '-orders -city -favoriteProducts -role -password -refreshToken -novaPost',
      )
      .populate('orderedItems.dimensions.color')
      .populate('orderedItems.product.dimensions.color')
      .select('-city -novaPost')
      .lean()
      .skip(skip)
      .limit(limit)
      .exec();

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const orderedItems = await this.getOrderedItems(order);
        return {
          ...order,
          orderedItems,
        };
      }),
    );

    return ordersWithItems;
  }

  async getPaginatedOrdersBy(dto: FindByDto, skip: number, limit: number) {
    const query = this.orderModel.find();

    if (dto.statuses && dto.statuses.length > 0) {
      query.in('status', dto.statuses);
    }

    if (dto.paymentTypes && dto.paymentTypes.length > 0) {
      query.in('paymentType', dto.paymentTypes);
    }

    if (dto.deliveryTypes && dto.deliveryTypes.length > 0) {
      query.in('deliveryType', dto.deliveryTypes);
    }

    if (dto.fromDate) {
      const fromDate = new Date(dto.fromDate).toISOString();
      query.gte('createdAt', fromDate);
    }

    if (dto.toDate) {
      const toDate = new Date(dto.toDate).toISOString();
      query.lte('createdAt', toDate);
    }

    // Apply pagination by adding the skip and limit options
    const paginatedOrders = await query
      .sort({ createdAt: -1 })
      .populate({
        path: 'client',
        select:
          '-orders -city -favoriteProducts -role -password -refreshToken -novaPost', // Exclude fields
      })
      .populate('orderedItems.dimensions.color')
      .populate('orderedItems.product.dimensions.color')
      .select('-city -novaPost')
      .lean()
      .skip(skip)
      .limit(limit)
      .exec();

    const paginatedOrdersWithImages = await Promise.all(
      paginatedOrders.map(async (order) => {
        const orderedItems = await this.getOrderedItems(order);

        return {
          ...order,
          orderedItems: orderedItems,
        };
      }),
    );

    return paginatedOrdersWithImages;
  }

  async getOrderedItems(order: Order): Promise<OrderedProduct[]> {
    // Create a map of productId to promise of getProductById
    const productPromisesMap: Record<
      string,
      Promise<ProductWithCostPrice | null>
    > = {};

    order.orderedItems.forEach((orderedItem) => {
      const productId = orderedItem.product.toString();
      // Only add a promise for products that haven't been added yet
      if (!productPromisesMap[productId]) {
        productPromisesMap[productId] =
          this.productsService.getProductById(productId);
      }
    });

    const productResults = await Promise.all(Object.values(productPromisesMap));

    const results = order.orderedItems.map((orderedItem) => {
      const productId = orderedItem.product.toString();
      const product = productResults.find(
        (p) => p && p._id.toString() === productId,
      );

      // Check if the product is not null
      if (product) {
        return {
          product: productId,
          productName: product.name,
          productPrice: product.salePrice,
          dimensions: orderedItem.dimensions,
        };
      }
      return null; // Return null for products that are null
    });

    return results.filter((result) => result !== null);
  }

  async createOrder(orderDto: CreateOrderDto) {
    let client: User;
    if (orderDto.userId) {
      client = await this.usersService.getUserById(orderDto.userId);
      if (!client) {
        throw new UserNotFoundException(orderDto.userId);
      }
    } else {
      client = await this.usersService.getUserByMobileNumber(
        orderDto.client.mobileNumber,
      );
      if (!client) {
        const dto = new UserDto();
        dto.firstName = orderDto.client.firstName;
        dto.secondName = orderDto.client.secondName;
        dto.mobileNumber = orderDto.client.mobileNumber;
        dto.city = orderDto.city;
        client = await this.usersService.createGuestUser(dto);
      }
    }

    const productUpdatePromises = orderDto.products.map(async (product) => {
      const dimensionsToSave = product.dimensions.map(convertToDimension);

      const productToUpdate = await this.productsService.getProductDocumentById(
        product._id,
      );
      if (!productToUpdate) {
        throw new ProductNotAvailableException(product._id);
      }

      dimensionsToSave.forEach((dimension) => {
        const matchingDimension = productToUpdate.dimensions.find((dim) =>
          compareDimensions(dim, dimension),
        );
        if (
          matchingDimension &&
          matchingDimension.quantity >= dimension.quantity
        ) {
          matchingDimension.quantity -= dimension.quantity;
        } else {
          throw new ProductNotAvailableException(
            productToUpdate._id.toString(),
            dimension.color,
            dimension.size,
            dimension.material,
            dimension.quantity,
          );
        }
      });

      await productToUpdate.save();

      return {
        product: product._id,
        dimensions: dimensionsToSave,
      };
    });

    const orderedItems = await Promise.all(productUpdatePromises);

    const createdOrder = new this.orderModel({
      ...orderDto,
      client,
      city: orderDto.city,
      novaPost: orderDto.novaPost,
      orderedItems,
    });
    const savedOrder = await createdOrder.save();

    await Promise.all([
      this.orderModel.populate(savedOrder, {
        path: 'orderedItems.product.dimensions.color',
      }),
      this.orderModel.populate(savedOrder, {
        path: 'orderedItems.dimensions.color',
      }),
    ]);

    await this.usersService.addOrder(client._id.toString(), savedOrder);
    return savedOrder.toObject();
  }

  async editOrder(orderDto: ChangeOrderDto): Promise<OrderDocument> {
    // Check if orderDto.products is present and not empty
    const shouldUpdateProducts =
      orderDto.products && orderDto.products.length > 0;

    // If products are present, update the orderedItems field
    const orderedItems = shouldUpdateProducts
      ? orderDto.products.map((product) => ({
          product: product._id,
          dimensions: product.dimensions,
        }))
      : undefined;

    // Remove the products field from orderDto to avoid updating it
    delete orderDto.products;

    // Update the order, including the orderedItems field if necessary
    const updatedOrder = await this.orderModel.findByIdAndUpdate(
      { _id: orderDto.orderId },
      shouldUpdateProducts ? { ...orderDto, orderedItems } : orderDto,
      { new: true },
    );

    if (!updatedOrder) {
      throw new OrderNotFoundException(orderDto.orderId);
    }

    return updatedOrder;
  }

  async changeOrderStatus(
    orderId: string,
    newStatus: Status,
  ): Promise<OrderDocument> {
    const session = await this.orderModel.db.startSession();
    session.startTransaction();

    try {
      const order = await this.getOrderWithSession(orderId, session);
      await this.handleStatusChange(order, newStatus, session);
      await session.commitTransaction();
      session.endSession();

      return order;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  private async getOrderWithSession(
    orderId: string,
    session: mongoose.ClientSession,
  ) {
    const order = await this.orderModel.findById(orderId).session(session);
    if (!order) {
      throw new OrderNotFoundException(orderId);
    }
    return order;
  }
  private isStatusChangeValid(
    currentStatus: Status,
    newStatus: Status,
  ): boolean {
    const statusesToCheck = [
      Status.Canceled,
      Status.Returned,
      Status.PaymentFailed,
    ];
    return (
      (statusesToCheck.includes(newStatus) &&
        !statusesToCheck.includes(currentStatus)) ||
      (!statusesToCheck.includes(newStatus) &&
        statusesToCheck.includes(currentStatus))
    );
  }

  private async handleStatusChange(
    order: mongoose.Document<unknown, {}, OrderDocument> & Order & Document,
    newStatus: Status,
    session: mongoose.ClientSession,
  ) {
    const statusesToCheck = [
      Status.Canceled,
      Status.Returned,
      Status.PaymentFailed,
    ];

    if (statusesToCheck.includes(newStatus)) {
      // Increment quantities when changing to Canceled, Returned, or PaymentFailed
      await this.processOrderedItems(
        order.orderedItems,
        session,
        this.incrementProductsQuantities,
      );
    } else if (statusesToCheck.includes(order.status)) {
      // Decrement quantities when changing from Canceled, Returned, or PaymentFailed
      await this.processOrderedItems(
        order.orderedItems,
        session,
        this.decrementProductsQuantities,
      );
    }

    order.status = newStatus;
    await order.save({ session });
  }

  private async processOrderedItems(
    orderedItems: OrderedItem[],
    session: mongoose.ClientSession,
    operation: (
      productId: string,
      dimensions: Dimension[],
      session: mongoose.ClientSession,
    ) => Promise<void>,
  ) {
    for (const orderedItem of orderedItems) {
      await operation(
        orderedItem.product.toString(),
        orderedItem.dimensions,
        session,
      );
    }
  }

  private async incrementProductsQuantities(
    productId: string,
    dimensions: Dimension[],
    session: mongoose.ClientSession,
  ) {
    const productToUpdate = (
      await this.productsService.getProductById(productId)
    ).session(session);

    if (!productToUpdate) {
      throw new ProductNotAvailableException(productId);
    }

    for (const dimension of dimensions) {
      const matchingDimension = productToUpdate.dimensions.find((dim) =>
        compareDimensions(dim, dimension),
      );

      if (matchingDimension) {
        matchingDimension.quantity += dimension.quantity;
      }
    }

    await productToUpdate.save({ session });
  }

  private async decrementProductsQuantities(
    productId: string,
    dimensions: Dimension[],
    session: mongoose.ClientSession,
  ) {
    const productToUpdate = (
      await this.productsService.getProductById(productId)
    ).session(session);

    if (!productToUpdate) {
      throw new ProductNotAvailableException(productId);
    }

    for (const dimension of dimensions) {
      const matchingDimension = productToUpdate.dimensions.find((dim) =>
        compareDimensions(dim, dimension),
      );

      if (
        matchingDimension &&
        matchingDimension.quantity >= dimension.quantity
      ) {
        matchingDimension.quantity -= dimension.quantity;
      } else {
        // Handle the case where the quantity cannot be decremented
        throw new Error(`Cannot decrement quantity for product ${productId}`);
      }
    }

    await productToUpdate.save({ session });
  }

  async deleteOrder(orderId: string) {
    await this.orderModel.findByIdAndDelete(orderId).exec();
  }

  async getOrderById(orderId: string) {
    // Specify the fields you want to include in the 'client' population
    const clientFieldsToInclude =
      'firstName secondName middleName instagram mobileNumber email';

    // Find the order by ID in the database and populate the 'orderedItems.product' field
    const order = await this.orderModel
      .findById(orderId)

      .populate({
        path: 'client', // Populate the 'client' field
        select: clientFieldsToInclude,
      })
      .populate('orderedItems.dimensions.color')
      .populate('orderedItems.product.dimensions.color')
      .lean()
      .exec();

    if (!order) {
      throw new OrderNotFoundException(orderId);
    }

    const orderedItems = await this.getOrderedItems(order);

    return {
      ...order,
      orderedItems: orderedItems,
    };
  }

  async getOrderDocumentById(orderId: string) {
    const order = await this.orderModel.findById(orderId).exec();

    if (!order) {
      throw new OrderNotFoundException(orderId);
    }

    return order;
  }

  async getOrdersByUserId(userId: string, skip: number, limit: number) {
    const orders = await this.orderModel
      .find({ client: userId })
      .sort({ createdAt: -1 })
      .populate('orderedItems.dimensions.color')
      .lean()
      .skip(skip)
      .limit(limit)
      .exec();

    const ordersObjects = await Promise.all(
      orders.map(async (order) => {
        const orderedItems = await this.getOrderedItems(order);

        return {
          ...order,
          orderedItems: orderedItems,
        };
      }),
    );

    return ordersObjects;
  }

  private async getClient(orderDto: CreateOrderDto): Promise<User> {
    let client: User;

    if (orderDto.userId) {
      client = await this.usersService.getUserById(orderDto.userId);
    } else {
      client = await this.usersService.getUserByMobileNumber(
        orderDto.client.mobileNumber,
      );

      if (!client) {
        const dto = new UserDto();
        dto.firstName = orderDto.client.firstName;
        dto.secondName = orderDto.client.secondName;
        dto.mobileNumber = orderDto.client.mobileNumber;
        dto.city = orderDto.city;
        client = await this.usersService.createGuestUser(dto);
      }
    }

    if (!client) {
      throw new UserNotFoundException(
        orderDto.userId || orderDto.client.mobileNumber,
      );
    }

    return client;
  }

  private async createOrderedItems(products: any[]): Promise<any[]> {
    const orderedItems = [];

    for (const product of products) {
      const dimensionsToSave = product.dimensions.map((e) =>
        convertToDimension(e),
      );

      for (const dimension of dimensionsToSave) {
        await this.reduceProductQuantity(product._id, dimension);
      }

      orderedItems.push({
        product: product._id,
        dimensions: dimensionsToSave,
      });
    }

    return orderedItems;
  }

  private async reduceProductQuantity(productId: string, dimension: any) {
    const productToUpdate =
      await this.productsService.getProductById(productId);

    if (!productToUpdate) {
      throw new ProductNotAvailableException(productId);
    }

    const matchingDimension = productToUpdate.dimensions.find((dim) =>
      compareDimensions(dim, dimension),
    );

    if (!matchingDimension || matchingDimension.quantity < dimension.quantity) {
      throw new ProductNotAvailableException(
        productId,
        dimension.color,
        dimension.size,
        dimension.material,
        dimension.quantity,
      );
    }

    matchingDimension.quantity -= dimension.quantity;
    await productToUpdate.save();
  }

  private async saveOrder(
    orderDto: CreateOrderDto,
    client: User,
    orderedItems: any[],
  ) {
    const createdOrder = new this.orderModel({
      ...orderDto,
      client,
      city: orderDto.city,
      novaPost: orderDto.novaPost,
      orderedItems,
    });

    return await createdOrder.save();
  }

  private async populateOrderedItems(order: OrderDocument) {
    await this.orderModel.populate(order, {
      path: 'orderedItems.product.dimensions.color',
    });

    await this.orderModel.populate(order, {
      path: 'orderedItems.dimensions.color',
    });
  }
}
