import userRepository from '../repositories/userRepository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../config/env';

const generateToken = (payload: any, secret: string, expiresIn: string) => {
  return jwt.sign(payload, secret, { expiresIn });
};

const register = async (data: any,userTpye : string) => {
  const where = { email: data.email };

  if (!data.email || !data.password) {
    throw new Error('이메일 및 패스워드를 입력해주세요.');
  }
  if(!userTpye || userTpye !== 'CUSTOMER' && userTpye !== 'MOVER') {
    throw new Error('유저 타입을 확인해주세요.'); 
  }
  if (!data.name) {
    throw new Error('이름을 입력해주세요.');
  }
  if (!data.phoneNumber) {
    throw new Error('전화번호를 입력해주세요.');
  }
  if (await userRepository.findFirstData({ where })) {
    throw new Error('이미 사용중인 이메일 입니다.');
  }
  data.password = await bcrypt.hash(data.password, 10);
  data.userType = userTpye
  return await userRepository.createData({ data });
};

const userLogin = async (data: any) => {
  if (!data.email || !data.password) {
    throw new Error("이메일 및 패스워드를 입력해주세요.");
  }

  const user = await userRepository.findFirstData({
    where: { email: data.email },
  });
  if(!user) {
    throw new Error("존재하지 않은 이메일 입니다.")
  }

  const isValidPassword = await bcrypt.compare(data.password, user.password as string);
  if (!isValidPassword) {
    throw new Error("비밀번호가 올바르지 않습니다.");
  }

  if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
    throw new Error("환경 변수가 설정되지 않았습니다.");
  }

  const isSecure = process.env.NODE_ENV === "production";

  const cookieOptions = {
    accessToken: {
      httpOnly: true,
      secure: isSecure,
      maxAge: 1000 * 60 * 60,
      sameSite: "strict",
    },
    refreshToken: {
      httpOnly: true,
      secure: isSecure,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: "strict",
    },
  };

  const accessToken = generateToken(
    { id: user.id },
    ACCESS_TOKEN_SECRET,
    `${cookieOptions.accessToken.maxAge / 1000}s`
  );
  const refreshToken = generateToken(
    { id: user.id },
    REFRESH_TOKEN_SECRET,
    `${cookieOptions.refreshToken.maxAge / 1000}s`
  );

  return {
    user,
    accessToken,
    refreshToken,
    cookieOptions,
  };
};

export { register, userLogin };