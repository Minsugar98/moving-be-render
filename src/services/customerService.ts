import bcrypt from 'bcrypt';
import userRepository from '../repositories/userRepository';
import customerRepository from '../repositories/customerRepository';
import { $Enums } from '@prisma/client';


const createCustomer = async (userId: number) => {
    const data =  {
        userId : userId,
        region : 'NULL' as $Enums.serviceRegion,
        serviceType : [],
    }

    const customerData = await customerRepository.createData({ data });
    
    return customerData;
}

const patchCustomerProfile = async (userId: number, data: any) => {
    const customerData = await customerRepository.findFirstData({ where: { userId: userId } });//
    if(!customerData) {
        throw new Error("프로필 생성하지 않음");
    }
    const patchData = {
        profileImage : data.profileImage,
        serviceType : data.serviceType,
        region : data.region,
    }
    const where = { id : customerData.id}
    return await customerRepository.updateData({ where, data : patchData });
};

const patchCustomerInfo = async (userId: number, data: any) => {
    const userData = await userRepository.findFirstData({ where: { id: userId } });
    if(!userData) {
        throw new Error("유저 정보 없음");
    }
    const isPasswordMatch = await bcrypt.compare(data.usedPassword, userData.password as string);
    if (!isPasswordMatch) {
        throw new Error("비밀번호가 일치하지 않아요");
    }
    const newHashedPassword = await bcrypt.hash(data.newPassword, 10);
    const patchData = {
        name : data.name,
        phoneNumber : data.phoneNumber,
        password : newHashedPassword,
    }
    const where = { id : userData.id}
    return await userRepository.updateData({ where, data : patchData });

};

export { patchCustomerProfile, patchCustomerInfo,createCustomer };