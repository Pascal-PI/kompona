import Stripe from 'stripe';

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  const connectorName = 'stripe';
  const isProduction = process.env.REPLIT_DEPLOYMENT === '1';
  const targetEnvironment = isProduction ? 'production' : 'development';

  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set('include_secrets', 'true');
  url.searchParams.set('connector_names', connectorName);
  url.searchParams.set('environment', targetEnvironment);

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'X_REPLIT_TOKEN': xReplitToken
    }
  });

  const data = await response.json();
  const connectionSettings = data.items?.[0];

  if (!connectionSettings?.settings?.secret) {
    throw new Error(`Stripe ${targetEnvironment} connection not found`);
  }

  return connectionSettings.settings.secret;
}

async function seedProducts() {
  const secretKey = await getCredentials();
  const stripe = new Stripe(secretKey, { apiVersion: '2025-08-27.basil' });

  console.log('Creating Pexeso game products in Stripe...\n');

  const existingProducts = await stripe.products.search({ query: "active:'true'" });
  const existingProductNames = existingProducts.data.map(p => p.name);

  if (existingProductNames.includes('Animal Theme Pack')) {
    console.log('Animal Theme Pack already exists, skipping...');
  } else {
    const animalsProduct = await stripe.products.create({
      name: 'Animal Theme Pack',
      description: 'Cute animal images for your Pexeso cards! Includes 64 unique animal designs.',
      metadata: {
        theme: 'animals',
        type: 'theme_pack'
      }
    });
    console.log('Created: Animal Theme Pack', animalsProduct.id);

    await stripe.prices.create({
      product: animalsProduct.id,
      unit_amount: 99,
      currency: 'usd',
      metadata: { theme: 'animals' }
    });
    console.log('  - Price: $0.99 (one-time)');
  }

  if (existingProductNames.includes('Barbie Theme Pack')) {
    console.log('\nBarbie Theme Pack already exists, skipping...');
  } else {
    const barbieProduct = await stripe.products.create({
      name: 'Barbie Theme Pack',
      description: 'Fabulous Barbie-themed images for your Pexeso cards! Includes 64 unique designs.',
      metadata: {
        theme: 'barbie',
        type: 'theme_pack'
      }
    });
    console.log('\nCreated: Barbie Theme Pack', barbieProduct.id);

    await stripe.prices.create({
      product: barbieProduct.id,
      unit_amount: 99,
      currency: 'usd',
      metadata: { theme: 'barbie' }
    });
    console.log('  - Price: $0.99 (one-time)');
  }

  if (existingProductNames.includes('Puppy Theme Pack')) {
    console.log('\nPuppy Theme Pack already exists, skipping...');
  } else {
    const puppyProduct = await stripe.products.create({
      name: 'Puppy Theme Pack',
      description: 'Adorable puppy images for your Pexeso cards! Includes 64 unique puppy designs.',
      metadata: {
        theme: 'puppy',
        type: 'theme_pack'
      }
    });
    console.log('\nCreated: Puppy Theme Pack', puppyProduct.id);

    await stripe.prices.create({
      product: puppyProduct.id,
      unit_amount: 99,
      currency: 'usd',
      metadata: { theme: 'puppy' }
    });
    console.log('  - Price: $0.99 (one-time)');
  }

  if (existingProductNames.includes('Pexeso Premium')) {
    console.log('\nPexeso Premium already exists, skipping...');
  } else {
    const premiumProduct = await stripe.products.create({
      name: 'Pexeso Premium',
      description: 'Unlock ALL theme packs and support the game! Includes all current and future themes.',
      metadata: {
        type: 'premium_subscription'
      }
    });
    console.log('\nCreated: Pexeso Premium', premiumProduct.id);

    await stripe.prices.create({
      product: premiumProduct.id,
      unit_amount: 299,
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { type: 'premium' }
    });
    console.log('  - Price: $2.99/month (subscription)');
  }

  if (existingProductNames.includes('Pexeso Platinum')) {
    console.log('\nPexeso Platinum already exists, skipping...');
  } else {
    const platinumProduct = await stripe.products.create({
      name: 'Pexeso Platinum',
      description: 'The ultimate Pexeso experience! All themes, Tournament access, exclusive AI difficulty levels, and more.',
      metadata: {
        type: 'platinum_subscription'
      }
    });
    console.log('\nCreated: Pexeso Platinum', platinumProduct.id);

    await stripe.prices.create({
      product: platinumProduct.id,
      unit_amount: 499,
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { type: 'platinum' }
    });
    console.log('  - Price: $4.99/month (subscription)');
  }

  console.log('\n✓ Product seeding complete!');
  console.log('\nProducts will sync automatically via webhooks.');
}

seedProducts().catch(console.error);
