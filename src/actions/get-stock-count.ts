export const getStockCount = async (): Promise<number> => {
    // Simulating the count of products in stock
    // You can replace this with actual sample data
    const sampleData = [
      { isArchived: false },
      { isArchived: false },
      { isArchived: false },
      { isArchived: true }, // Assuming this product is archived
      // Add more sample data as needed
    ];
  
    // Counting the number of products in stock (not archived)
    const stockCount = sampleData.filter(product => !product.isArchived).length;
  
    return stockCount;
  };
  