const router = require('express').Router();
module.exports = router;

const prisma = require('../prisma');

/** Returns an array of all authors in database. */
router.get('/', async (req, res, next) => {
  try {
    const authors = await prisma.author.findMany();
    res.json(authors);
  } catch {
    /*
      Any errors caught here should only be thrown when there's an issue
      with Prisma, such as the database being down or a malformed query.
      These are server-side errors, so we don't want to send them to the client.

      Instead, by calling `next` with no arguments, the client will get
      a generic error message as defined in `server.js`
    */
    next();
  }
});

/** Creates a new author as provided by the request body. */
router.post('/', async (req, res, next) => {
  try {
    /*
      We don't want to pass the request body directly to Prisma;
      Instead, we should sanitize it and extract only the properties we need.
      This allows us to catch invalid data before it reaches the database.
    */
    const { name } = req.body;

    // We want to send a meaningful error message to the client
    if (!name) {
      // This object doesn't contain too much information,
      // but it's all we need for now based on our only error handling middleware.
      const error = {
        status: 400,
        message: 'Author must have a name.',
      };

      // We need to `return` here; otherwise, the function will continue.
      return next(error);
    }

    const author = await prisma.author.create({ data: { name } });
    res.json(author);
  } catch {
    next();
  }
});

/** Returns a single author with the specified id. */
router.get('/:id', async (req, res, next) => {
  try {
    const id = +req.params.id;

    const author = await prisma.author.findUnique({ where: { id } });

    if (!author) {
      return next({
        status: 404,
        message: `Could not find author with id ${id}.`,
      });
    }

    res.json(author);
  } catch {
    next();
  }
});

/** Overwrites the specified author as provided by the request body. */
router.put('/:id', async (req, res, next) => {
  try {
    const id = +req.params.id;

    // First check if the author exists
    const authorExists = await prisma.author.findUnique({ where: { id } });
    if (!authorExists) {
      return next({
        status: 404,
        message: `Could not find author with id ${id}.`,
      });
    }

    // Then validate the request body
    const { name } = req.body;
    if (!name) {
      return next({
        status: 400,
        message: 'Author must have a name.',
      });
    }

    /*
      At this point, we know the author exists and the request body is valid,
      so we're good to update the author.
      However, this required two database calls, which is inefficient.
      A better error handler would allow us to gracefully catch the error that
      Prisma throws on an invalid update.
    */
    const author = await prisma.author.update({
      where: { id },
      data: { name },
    });

    res.json(author);
  } catch {
    next();
  }
});

/** Deletes the author with the specified id. */
router.delete('/:id', async (req, res, next) => {
  // This is a very similar pattern to the PUT route above.
  try {
    const id = +req.params.id;

    const authorExists = await prisma.author.findUnique({ where: { id } });
    if (!authorExists) {
      return next({
        status: 404,
        message: `Could not find author with id ${id}.`,
      });
    }

    await prisma.author.delete({ where: { id } });

    res.sendStatus(204);
  } catch {
    next();
  }
});

/** Returns all books written by the author with the specified id. */
router.get('/:id/books', async (req, res, next) => {
  try {
    const id = +req.params.id;

    // Check if author exists
    const author = await prisma.author.findUnique({ where: { id } });
    if (!author) {
      return next({
        status: 404,
        message: `Could not find author with id ${id}.`,
      });
    }

    const books = await prisma.book.findMany({ where: { authorId: id } });

    res.json(books);
  } catch {
    next();
  }
});

/** Creates a new book for the author with the specified id. */
router.post('/:id/books', async (req, res, next) => {
  try {
    const id = +req.params.id;

    // Check if author exists
    const author = await prisma.author.findUnique({ where: { id } });
    if (!author) {
      return next({
        status: 404,
        message: `Could not find author with id ${id}.`,
      });
    }

    // Validate request body
    const { title } = req.body;
    if (!title) {
      return next({
        status: 400,
        message: 'Book must have a title.',
      });
    }

    const book = await prisma.book.create({
      data: { title, author: { connect: { id } } },
    });

    res.json(book);
  } catch {
    next();
  }
});
