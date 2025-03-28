import cron from 'node-cron';
import { todayUTC } from '../utils/dateUtil';
import estimateRepository from '../repositories/estimateRepository';
import {
  estimateSelect,
  estimateWithMovingInfoAndCustomerUserAndMoverUserAndEstimateReqIdSelect,
} from './selects/estimateSelect';
import notificationRepository from '../repositories/notificationRepository';
import { createNotificationContents } from '../utils/createNotificationContents';

//알림용 import 
import { sendNotification } from '../controllers/notificationController';

export function midnightTaskScheduler() {
  cron.schedule('00 15 * * *', async () => {
    console.log('스케줄러 실행: ', new Date());

    try {
      const todayString = todayUTC();
      const todayTime = new Date(todayString).getTime();
      const oneDaysLaterTime = todayTime + 1000 * 60 * 60 * 24;
      const oneDaysLater = new Date(oneDaysLaterTime).toISOString();
      const twoDaysLaterTime = todayTime + 1000 * 60 * 60 * 48;
      const twoDaysLater = new Date(twoDaysLaterTime).toISOString();

      const [estimateList1, estimateList2] = await Promise.all([
        estimateRepository.findManyData({
          where: {
            status: 'ACCEPTED',
            isMovingComplete: false,
            MovingInfo: { movingDate: { lt: todayString } },
          },
          select: estimateSelect,
        }),

        estimateRepository.findManyData({
          where: {
            status: 'ACCEPTED',
            isMovingComplete: false,
            MovingInfo: {
              movingDate: {
                gte: oneDaysLater, // 다음날 이상
                lt: twoDaysLater, // 다다음날 미만
              },
            },
          },
          select:
            estimateWithMovingInfoAndCustomerUserAndMoverUserAndEstimateReqIdSelect,
        }),
      ]);

      const data = estimateList2.flatMap((estimate) => {
        const { MovingInfo, Customer, Mover, EstimateRequest, ...rest } =
          estimate;
        const contents = createNotificationContents({
          type: '1-day',
          departure: MovingInfo.departure,
          arrival: MovingInfo.arrival,
        }) as string;

        return [
          {
            userId: Mover.User.id,
            estimateRequestId: EstimateRequest.id,
            estimateId: rest.id,
            contents,
          },
          {
            userId: Customer.User.id,
            estimateRequestId: EstimateRequest.id,
            estimateId: rest.id,
            contents,
          },
        ];
      });

      const notifications = await Promise.all([
        // 이사 완료 정보 수정
        ...estimateList1.map(async (estimate) => {
          await estimateRepository.updateData({
            where: { id: estimate.id },
            data: { isMovingComplete: true },
          });
        }),

        // 이사 전날 확인 알람 생성
        notificationRepository.createManyData({ data }),
      ]);

      // 알림 발송 추가
      const createdNotifications = notifications.pop();
      if (Array.isArray(createdNotifications)) {
        createdNotifications.forEach((notification) => {
          sendNotification(String(notification.userId), notification);
        });
      }

    } catch (err) {
      console.log(err);
    }
  });
}
