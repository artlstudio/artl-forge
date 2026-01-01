export const exampleJob = {
  name: 'example',
  handler: async (logger) => {
    logger.info('Example job running...');

    // Simulate some work
    await new Promise((resolve) => setTimeout(resolve, 1000));

    logger.info('Example job completed');
  },
};
