import { prisma } from '../../helper/helperDB';
import * as fs from 'fs/promises';
import * as path from 'path';
import pLimit from 'p-limit';

import { CONCURRENCY_LIMIT } from './seedingMain';

const BATCH_SIZE = 100; // 배치 크기
// const CONCURRENCY_LIMIT = 10; // 비동기 큐 최대 동시 실행 작업 수
const FAILED_DATA_DIR = path.join(__dirname, '../faildata'); // 실패한 데이터 저장 디렉터리
const FAILED_DATA_FILE = path.join(FAILED_DATA_DIR, 'failed_estimate_requests.json'); // 실패한 데이터 저장 파일 경로

async function saveFailedData(data: any[], filePath: string) {
  try {
    await fs.mkdir(FAILED_DATA_DIR, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`❌ 실패한 데이터를 저장하는 중 오류 발생: ${filePath}`, error);
  }
}

async function retryFailedData(failedFilePath: string, createFn: (item: any) => Promise<void>) {
  try {
    const fileExists = await fs
      .stat(failedFilePath)
      .then(() => true)
      .catch(() => false);

    if (!fileExists) {
      console.log(`✨ ${failedFilePath} 파일이 존재하지 않아 재시도할 데이터가 없습니다.`);
      return true; // No data to retry
    }

    const failedData = JSON.parse(await fs.readFile(failedFilePath, 'utf-8'));

    if (!Array.isArray(failedData) || failedData.length === 0) {
      console.log(`✨ ${failedFilePath}에 유효한 데이터가 없어 재시도 작업을 건너뜁니다.`);
      await fs.unlink(failedFilePath); // 삭제
      return true; // No data to retry
    }

    console.log(`🔄 ${failedFilePath}에 저장된 실패 데이터를 다시 시도합니다...`);

    const limit = pLimit(CONCURRENCY_LIMIT);
    const retryFailed: any[] = [];

    await Promise.all(
      failedData.map((item) =>
        limit(async () => {
          try {
            await createFn(item);
          } catch (error) {
            console.error(`❌ 재처리 실패: ${JSON.stringify(item)}`, error);
            retryFailed.push(item);
          }
        })
      )
    );

    if (retryFailed.length > 0) {
      await saveFailedData(retryFailed, failedFilePath);
      console.log(`❌ 재시도 실패 데이터를 ${failedFilePath}에 저장했습니다.`);
      return false; // Some data failed
    } else {
      await fs.unlink(failedFilePath);
      console.log(`✅ 모든 실패 데이터를 성공적으로 처리하여 ${failedFilePath} 파일을 삭제했습니다.`);
      return true; // All data succeeded
    }
  } catch (error) {
    console.error(`❌ 실패 데이터를 다시 처리하는 중 오류 발생: ${failedFilePath}`, error);
    return false;
  }
}

export async function seedEstimateRequests() {
  const failedRequests: any[] = []; // 실패한 데이터 저장 배열

  try {
    console.log('🚀 EstimateRequest 데이터 시딩을 시작합니다...');

    const estimateRequestFilePath = path.join(__dirname, '../data/estimateRequest.json');
    const fileData = await fs.readFile(estimateRequestFilePath, 'utf-8');
    const estimateRequests = JSON.parse(fileData);

    if (!Array.isArray(estimateRequests) || estimateRequests.length === 0) {
      console.log('⚠️ JSON 파일에 유효한 데이터가 없습니다.');
      return;
    }

    console.log(`📄 총 ${estimateRequests.length}개의 EstimateRequest 데이터를 읽었습니다.`);

    const existingRecords = await prisma.estimateRequest.findMany({
      select: { id: true },
    });
    const existingIds = new Set(existingRecords.map((record) => record.id));

    const filteredRequests = estimateRequests.filter(
      (request: any) => !existingIds.has(request.id)
    );

    console.log(`✅ 처리할 EstimateRequest 데이터: ${filteredRequests.length}개 (중복 제외됨)`);

    if (filteredRequests.length === 0) {
      console.log('✨ 중복되지 않은 데이터가 없어 작업을 종료합니다.');
      return;
    }

    const limit = pLimit(CONCURRENCY_LIMIT);

    for (let i = 0; i < filteredRequests.length; i += BATCH_SIZE) {
      const batch = filteredRequests.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.ceil(i / BATCH_SIZE) + 1;

      console.log(`🛠️ 배치 ${batchNumber} 처리 중...`);

      await Promise.all(
        batch.map((request: any, index) =>
          limit(async () => {
            try {
              await prisma.estimateRequest.create({
                data: request,
              });
              console.log(`✅ [${i + index + 1}/${filteredRequests.length}] 성공 (customer_ID) : ${request.customerId}`);
            } catch (error) {
              console.error(`❌ 삽입 실패: ${request.customerId}`, error);
              failedRequests.push(request);
            }
          })
        )
      );

      console.log(`🎉 배치 ${batchNumber} 완료!`);
    }

    console.log('✨ 모든 EstimateRequest 데이터를 성공적으로 처리했습니다!');
  } catch (error) {
    console.error('🔥 EstimateRequest 데이터 시딩 중 오류 발생:', error);
  } finally {
    if (failedRequests.length > 0) {
      console.log(`❌ ${failedRequests.length}개의 실패한 데이터를 ${FAILED_DATA_FILE}에 저장합니다.`);
      await saveFailedData(failedRequests, FAILED_DATA_FILE);
    } else {
      console.log('✅ 모든 데이터를 성공적으로 처리하여 실패 데이터가 없습니다.');
    }

    const allSuccess = await retryFailedData(FAILED_DATA_FILE, async (request) => {
      await prisma.estimateRequest.create({
        data: request,
      });
    });

    if (allSuccess) {
      console.log('✨ 모든 실패 데이터를 성공적으로 재처리했습니다!');
    } else {
      console.log('❌ 일부 실패 데이터가 여전히 남아 있습니다.');
    }
  }
}

// 파일이 직접 실행되었는지 확인
if (require.main === module) {
  seedEstimateRequests()
    .catch((error) => {
      console.error('❌ 시딩 작업 중 오류 발생:', error);
    })
    .finally(async () => {
      await prisma.$disconnect();
      console.log('🔌 Prisma 클라이언트 연결이 해제되었습니다.');
    });
}
