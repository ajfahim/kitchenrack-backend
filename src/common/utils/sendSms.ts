import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { SmsProvider } from '../types/smsProvider';

export const sendSms = async (
  provider: SmsProvider,
  message: string,
  phoneNumber: string,
) => {
  const configService = new ConfigService();

  let url: string;
  switch (provider) {
    case SmsProvider.BULKSMSBD:
      const apiKey = configService.get<string>('BULKSMSBD_API_KEY');
      const senderId = configService.get<string>('BULKSMSBD_SENDER_ID');
      url = `http://bulksmsbd.net/api/smsapi?api_key=${apiKey}&type=text&number=${phoneNumber}&senderid=${senderId}&message=${message}`;

      try {
        const response = await axios.post(url);
        if (response.data?.response_code == 202) {
          return response.data;
        }
      } catch (err) {
        console.error('Failed to send SMS: ', err.error_message);
        throw new HttpException(
          'Failed to send SMS',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
  }
};
