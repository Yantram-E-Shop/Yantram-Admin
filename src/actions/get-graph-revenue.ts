export interface GraphData {
    name: string;
    total: number;
  }
  

export const getGraphRevenue = async (): Promise<GraphData[]> => {
  // Dummy data for demonstration
  const dummyPaidOrders = [
    {
      createdAt: new Date('2022-01-01'),
      orderItems: [
        { product: { price: 100 } }, // Assuming product price is 100 for this order item
        { product: { price: 50 } }, // Assuming product price is 50 for this order item
      ],
    },
    {
      createdAt: new Date('2022-02-15'),
      orderItems: [
        { product: { price: 80 } },
        { product: { price: 70 } },
      ],
    },
    // Add more dummy orders as needed
  ];

  // Grouping the orders by month and summing the revenue
  const monthlyRevenue: { [key: number]: number } = {};

  for (const order of dummyPaidOrders) {
    const month = order.createdAt.getMonth();
    let revenueForOrder = 0;

    for (const item of order.orderItems) {
      revenueForOrder += item.product.price;
    }

    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + revenueForOrder;
  }

  // Converting the grouped data into the format expected by the graph
  const graphData: GraphData[] = [
    { name: "Jan", total: 0 },
    { name: "Feb", total: 0 },
    { name: "Mar", total: 0 },
    { name: "Apr", total: 0 },
    { name: "May", total: 0 },
    { name: "Jun", total: 0 },
    { name: "Jul", total: 0 },
    { name: "Aug", total: 0 },
    { name: "Sep", total: 0 },
    { name: "Oct", total: 0 },
    { name: "Nov", total: 0 },
    { name: "Dec", total: 0 },
  ];

  // Filling in the revenue data
  for (const month in monthlyRevenue) {
    graphData[parseInt(month)].total = monthlyRevenue[parseInt(month)];
  }

  return graphData;
};
