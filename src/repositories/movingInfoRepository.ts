import prisma from '../config/prisma';
import { MovingInfoPagenationParamsByPage } from '../types/repositoryType';
import { Prisma } from '@prisma/client';

type MovingInfoSelectType = Prisma.MovingInfoSelect;

type MovingInfoPayload<T extends MovingInfoSelectType | undefined> =
  Prisma.MovingInfoGetPayload<{ select: T }>;

interface MovingInfoPagenationParams extends MovingInfoPagenationParamsByPage {
  where?: Prisma.MovingInfoWhereInput;
}

type MovingInfoUncheckedCreateInputType = Prisma.MovingInfoUncheckedCreateInput;

type MovingInfoWhereInputType = Prisma.MovingInfoWhereInput;

type MovingInfoWhereUniqueInputType = Prisma.MovingInfoWhereUniqueInput;

type MovingInfoUpdateInputType = Prisma.MovingInfoUpdateInput;

type MovingInfoOrderByType = Prisma.MovingInfoOrderByWithRelationInput;

// createData
function createData<T extends MovingInfoSelectType>({
  data,
  select,
  tx,
}: {
  data: MovingInfoUncheckedCreateInputType;
  select: T;
  tx?: Prisma.TransactionClient;
}): Promise<MovingInfoPayload<T>>;
function createData({
  data,
  tx,
}: {
  data: MovingInfoUncheckedCreateInputType;
  tx?: Prisma.TransactionClient;
}): Promise<MovingInfoPayload<undefined>>;

async function createData<T extends MovingInfoSelectType | undefined>({
  data,
  select,
  tx,
}: {
  data: MovingInfoUncheckedCreateInputType;
  select?: T;
  tx?: Prisma.TransactionClient;
}) {
  const db = tx || prisma;
  if (select === undefined) {
    return await db.movingInfo.create({ data });
  }
  return await db.movingInfo.create({
    data,
    select,
  });
}

// findFirstData
function findFirstData<T extends MovingInfoSelectType>({
  where,
  select,
  orderBy,
}: {
  where: MovingInfoWhereInputType;
  select: T;
  orderBy?: MovingInfoOrderByType;
}): Promise<MovingInfoPayload<T> | null>;
function findFirstData({
  where,
  orderBy,
}: {
  where: MovingInfoWhereInputType;
  orderBy?: MovingInfoOrderByType;
}): Promise<MovingInfoPayload<undefined> | null>;

async function findFirstData<T extends MovingInfoSelectType | undefined>({
  where,
  select,
  orderBy = { createdAt: 'desc' },
}: {
  where: MovingInfoWhereInputType;
  select?: T;
  orderBy?: MovingInfoOrderByType;
}) {
  if (select === undefined) {
    return await prisma.movingInfo.findFirst({ where, orderBy });
  }
  return await prisma.movingInfo.findFirst({
    where,
    select,
    orderBy,
  });
}

// findUniqueOrThrowtData
function findUniqueOrThrowtData<T extends MovingInfoSelectType>({
  where,
  select,
}: {
  where: MovingInfoWhereUniqueInputType;
  select: T;
}): Promise<MovingInfoPayload<T>>;
function findUniqueOrThrowtData({
  where,
}: {
  where: MovingInfoWhereUniqueInputType;
}): Promise<MovingInfoPayload<undefined>>;

async function findUniqueOrThrowtData<
  T extends MovingInfoSelectType | undefined
>({ where, select }: { where: MovingInfoWhereUniqueInputType; select?: T }) {
  if (select === undefined) {
    return await prisma.movingInfo.findUniqueOrThrow({ where });
  }
  return await prisma.movingInfo.findUniqueOrThrow({
    where,
    select,
  });
}

// countData
async function countData(where: MovingInfoWhereInputType): Promise<number> {
  return await prisma.movingInfo.count({ where });
}

// findManyByPaginationData
function findManyByPaginationData<T extends MovingInfoSelectType>({
  paginationParams,
  select,
}: {
  paginationParams: MovingInfoPagenationParams;
  select: T;
}): Promise<MovingInfoPayload<T>[]>;
function findManyByPaginationData({
  paginationParams,
}: {
  paginationParams: MovingInfoPagenationParams;
}): Promise<MovingInfoPayload<undefined>[]>;

async function findManyByPaginationData<
  T extends MovingInfoSelectType | undefined
>({
  paginationParams,
  select,
}: {
  paginationParams: MovingInfoPagenationParams;
  select?: T;
}) {
  const { orderBy, skip, take, where } = paginationParams;
  if (select === undefined) {
    return await prisma.movingInfo.findMany({
      orderBy,
      skip,
      take,
      where,
    });
  }
  return await prisma.movingInfo.findMany({
    orderBy,
    skip,
    take,
    where,
    select,
  });
}

//findManyData
function findManyData<T extends MovingInfoSelectType>({
  where,
  select,
  orderBy,
}: {
  where: MovingInfoWhereInputType;
  select: T;
  orderBy?: MovingInfoOrderByType;
}): Promise<MovingInfoPayload<T>[]>;
function findManyData({
  where,
  orderBy,
}: {
  where: MovingInfoWhereInputType;
  orderBy?: MovingInfoOrderByType;
}): Promise<MovingInfoPayload<undefined>[]>;

async function findManyData<T extends MovingInfoSelectType | undefined>({
  where,
  select,
  orderBy = { createdAt: 'desc' },
}: {
  where: MovingInfoWhereInputType;
  select?: T;
  orderBy?: MovingInfoOrderByType;
}) {
  if (select === undefined) {
    return await prisma.movingInfo.findMany({
      where,
      orderBy,
    });
  }
  return await prisma.movingInfo.findMany({
    where,
    select,
    orderBy,
  });
}

// updateData
function updateData<T extends MovingInfoSelectType>({
  where,
  data,
  select,
  tx,
}: {
  where: MovingInfoWhereUniqueInputType;
  data: MovingInfoUpdateInputType;
  select: T;
  tx?: Prisma.TransactionClient;
}): Promise<MovingInfoPayload<T>>;
function updateData({
  where,
  data,
  tx,
}: {
  where: MovingInfoWhereUniqueInputType;
  data: MovingInfoUpdateInputType;
  tx?: Prisma.TransactionClient;
}): Promise<MovingInfoPayload<undefined>>;

async function updateData<T extends MovingInfoSelectType | undefined>({
  where,
  data,
  select,
  tx,
}: {
  where: MovingInfoWhereUniqueInputType;
  data: MovingInfoUpdateInputType;
  select?: T;
  tx?: Prisma.TransactionClient;
}) {
  const db = tx || prisma;
  if (select === undefined) {
    return await db.movingInfo.update({ where, data });
  }
  return await db.movingInfo.update({ where, data, select });
}

// deleteData
async function deleteData(
  where: { id: number },
  tx?: Prisma.TransactionClient
): Promise<void> {
  const db = tx || prisma;
  await db.movingInfo.delete({ where });
}

export default {
  createData,
  findFirstData,
  findUniqueOrThrowtData,
  countData,
  findManyByPaginationData,
  updateData,
  deleteData,
  findManyData,
};
