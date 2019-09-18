const db = require('../src/db');
const faker = require('faker');
const bcrypt = require('bcryptjs');

// Ensures consistent results between script runs
faker.seed(69);

const { mutation } = db;

const NUM_USERS = 5;

async function main() {
  await createUsers();
}

async function createUsers() {
  const { createUser } = mutation;

  for (let i = 0; i < NUM_USERS; i++) {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();

    await createUser({
      data: {
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
        password: await bcrypt.hash('password', 10),
        decks: {
          create: [...Array((i + 1) * i * 10)].map(() => ({
            name: faker.company.bs(),
            cards: {
              create: [
                ...Array(Math.floor(Math.random() * Math.random() * Math.random() * 1000)),
              ].map(() => ({
                front: faker.lorem.sentence(),
                back: faker.lorem.sentence(),
              })),
            },
          })),
        },
      },
    });
  }
}

main().catch(e => console.error(e));
