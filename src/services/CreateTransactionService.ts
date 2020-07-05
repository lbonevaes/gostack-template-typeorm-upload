import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateCategoryService from './CreateCategoryService';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const createCategory = new CreateCategoryService();

    const categoryAdd = await createCategory.execute({
      title: category,
    });

    const balance = await transactionRepository.getBalance();

    if (type === 'outcome' && balance.total <= value) {
      throw new AppError('Insufficient value for this outcome', 400);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: categoryAdd.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
