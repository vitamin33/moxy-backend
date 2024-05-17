export enum PlaceProduction {
  China = 'china',
  Ukraine = 'ukraine',
}
export function parsePlaceProduction(value: string): PlaceProduction | undefined {
  const enumKeys = Object.keys(PlaceProduction).filter(
    (k) => typeof PlaceProduction[k as any] === 'string',
  );

  for (const key of enumKeys) {
    if (PlaceProduction[key as keyof typeof PlaceProduction] === value) {
      return PlaceProduction[key as keyof typeof PlaceProduction];
    }
  }

  return undefined;
}