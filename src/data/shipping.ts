export interface ShippingOption {
  id: string;
  title: string;
  description: string;
  price: number;
  estimatedDelivery: string;
}

export const shippingMethods: ShippingOption[] = [
  {
    id: "post",
    title: "پست پیشتاز",
    description: "ارسال سریع و مطمئن با شرکت پست جمهوری اسلامی ایران",
    price: 100000,
    estimatedDelivery: "۳ تا ۵ روز کاری",
  },
  {
    id: "tipax",
    title: "تیپاکس",
    description: "ارسال اختصاصی با تحویل سریع درب منزل",
    price: 75000,
    estimatedDelivery: "۱ تا ۲ روز کاری",
  },
];

export const DEFAULT_SHIPPING_METHOD_ID = "post";

export function getShippingMethods(): ShippingOption[] {
  return shippingMethods;
}

export function getShippingMethodById(id: string): ShippingOption | undefined {
  return shippingMethods.find((method) => method.id === id);
}
