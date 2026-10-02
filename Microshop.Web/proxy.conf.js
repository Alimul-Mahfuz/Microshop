const catalogTarget = process.env.services__catalogapi__http__0 || process.env.services__catalogapi__https__0 || 'http://localhost:5000';
const identityTarget = process.env.services__identityapi__http__0 || process.env.services__identityapi__https__0 || 'http://localhost:5000';
const basketTarget = process.env.services__basketapi__http__0 || process.env.services__basketapi__https__0 || 'http://localhost:5000';
const orderingTarget = process.env.services__orderingapi__http__0 || process.env.services__orderingapi__https__0 || 'http://localhost:5000';

console.log('--- Microshop Aspire Proxy Config ---');
console.log('Catalog API Target:', catalogTarget);
console.log('Identity API Target:', identityTarget);
console.log('Basket API Target:', basketTarget);
console.log('Ordering API Target:', orderingTarget);

module.exports = [
  {
    context: ['/api/v1/catalog'],
    target: catalogTarget,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug'
  },
  {
    context: ['/api/v1/identity'],
    target: identityTarget,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug'
  },
  {
    context: ['/api/v1/basket'],
    target: basketTarget,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug'
  },
  {
    context: ['/api/v1/orders'],
    target: orderingTarget,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug'
  }
];
