import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findEligibleCustomers(): Promise<number[]> {
  const today = new Date();

  // DB에서 모든 조건 후보군 조회 및 필터링
  const allCustomers = await prisma.estimateRequest.findMany({
    where: {
      isConfirmed: false, // isConfirmed가 false
      MovingInfo: {
        movingDate: {
          gt: today, // movingDate가 현재 날짜보다 미래
        },
      },
    },
    select: {
      customerId: true,
    },
  });

  // 중복 제거 후 customerId 반환
  const uniqueCustomerIds = Array.from(
    new Set(allCustomers.map((req) => req.customerId))
  );

  console.log(
    `Estimate를 요청할 수 있는 고객 수: ${uniqueCustomerIds.length}`
  );
  console.log('고객 ID 목록:', uniqueCustomerIds);

  return uniqueCustomerIds;
}

// 특정 고객의 MovingDate 조회 (내림차순 정렬)
async function findCustomerMovingDates(customerId: number) {
  const customerMovingDates = await prisma.estimateRequest.findMany({
    where: { customerId },
    select: {
      MovingInfo: {
        select: {
          movingDate: true, // movingDate를 Date 객체로 가져옴
        },
      },
    },
  });

  if (customerMovingDates.length === 0) {
    console.log(`customerId ${customerId}에 해당하는 데이터가 없습니다.`);
  } else {
    const movingDates = customerMovingDates
      .map((entry) => entry.MovingInfo?.movingDate)
      .filter(Boolean) // null 또는 undefined 제거
      .sort((a, b) => b!.getTime() - a!.getTime()); // Date 객체로 내림차순 정렬

    console.log(
      `customerId ${customerId}의 MovingDate 목록 (내림차순):`,
      movingDates
    );
  }
}

// 메인 함수
async function main() {
  const eligibleCustomers = await findEligibleCustomers();

  if (eligibleCustomers.length === 0) {
    console.log('Estimate를 요청할 수 있는 고객이 없습니다.');
    return;
  }

  const customerId = eligibleCustomers[0]; // 테스트용
  await findCustomerMovingDates(customerId);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
