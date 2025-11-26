require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function setupStripeProducts() {
  console.log('Setting up Stripe products...\n');

  const tiers = [
    { name: 'ELUXRAJ - Initiate', price: 188, description: 'Curated insights & foundation intelligence' },
    { name: 'ELUXRAJ - Sovereign', price: 808, description: 'Advanced strategies & private vault access' },
    { name: 'ELUXRAJ - Apex Circle', price: 2600, description: 'Invitation-only orchestration & priority placements' }
  ];

  for (const tier of tiers) {
    try {
      const product = await stripe.products.create({
        name: tier.name,
        description: tier.description,
      });

      console.log('Created product:', tier.name);

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: tier.price * 100,
        currency: 'usd',
        recurring: { interval: 'month' }
      });

      console.log('Price:', tier.price, 'per month');
      console.log('Price ID:', price.id);
      console.log('');

    } catch (error) {
      console.error('Error:', error.message);
    }
  }

  console.log('Done! Copy the Price IDs above to your .env file\n');
}

setupStripeProducts().then(() => process.exit(0));
