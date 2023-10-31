const prisma = require('../prisma');

/**
 * Creates 20 authors with 3 books each.
 * Note: this does not wipe the existing database!
 */
const seed = async (numAuthors = 20, booksPerAuthor = 3) => {
  /*
    We can't create multiple related records in a single nested write,
    so we'll create a single author at a time.
    https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#create-multiple-records-and-multiple-related-records
  */
  for (let i = 0; i < numAuthors; i++) {
    // Create array of books for author
    const books = [];
    for (let j = 0; j < booksPerAuthor; j++) {
      books.push({ title: `Book ${i}${j}` });
    }

    // Create the author
    await prisma.author.create({
      data: {
        name: `Author ${i}`,
        books: {
          create: books,
        },
      },
    });
  }
};

/** This is an alternative solution - it uses Array.from instead. */
const seedWithoutLoops = async (numAuthors = 20, booksPerAuthor = 3) => {
  /*
    Array.from() is a quick way to create an array of a certain length
    and fill it with dynamically generated data.
  */
  const createAuthorPromises = Array.from({ length: numAuthors }, (_, i) => {
    const books = Array.from({ length: booksPerAuthor }, (_, j) => ({
      title: `Book ${i}${j}`,
    }));
    return prisma.author.create({
      data: {
        name: `Author ${i}`,
        books: {
          create: books,
        },
      },
    });
  });

  /*
    Promise.all allows us to start all the `create` requests
    at the same time, rather than waiting for each one to finish.
    We then wait for all of them to finish with `await`.
  */
  await Promise.all(createAuthorPromises);
};

/*
  This is pulled from the Prisma docs.
  Since we're using the Prisma Client directly,
  we need to disconnect from it manually.

  We're also using `then` and `catch` instead of async/await
  because async/await doesn't work at the top level of a file.
*/
seed()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
