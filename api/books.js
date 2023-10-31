const router = require('express').Router();
module.exports = router;

const prisma = require('../prisma');

/** Returns an array of all books. */
router.get('/', async (req, res, next) => {
  try {
    const books = await prisma.book.findMany();
    res.json(books);
  } catch {
    next();
  }
});

/** Returns a single book with the specified id. */
router.get('/:id', async (req, res, next) => {
  try {
    const id = +req.params.id;

    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) {
      return next({
        status: 404,
        message: `Could not find book with id ${id}.`,
      });
    }

    res.json(book);
  } catch {
    next();
  }
});

/** Overwrites the book as provided by the request body. */
router.put('/:id', async (req, res, next) => {
  try {
    const id = +req.params.id;

    // First check if the book exists
    const bookExists = await prisma.book.findUnique({ where: { id } });
    if (!bookExists) {
      return next({
        status: 404,
        message: `Could not find book with id ${id}.`,
      });
    }

    // Then validate the request body
    const { title } = req.body;
    if (!title) {
      return next({
        status: 400,
        message: 'Book must have a title.',
      });
    }

    const book = await prisma.book.update({
      where: { id },
      data: { title },
    });

    res.json(book);
  } catch {
    next();
  }
});

/** Deletes the book with the specified id. */
router.delete('/:id', async (req, res, next) => {
  try {
    const id = +req.params.id;

    const bookExists = await prisma.book.findUnique({ where: { id } });
    if (!bookExists) {
      return next({
        status: 404,
        message: `Could not find book with id ${id}.`,
      });
    }

    await prisma.book.delete({ where: { id } });

    res.sendStatus(204);
  } catch {
    next();
  }
});
