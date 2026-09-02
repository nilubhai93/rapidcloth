import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Rapidcloth API',
      version: '1.0.0',
      description: 'API documentation for Rapidcloth backend',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/swagger/components/**/*.yaml',
    './src/routes/*.js',
    './src/controllers/*.js'
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('📄 Swagger docs available at http://localhost:5000/api/docs');
};
