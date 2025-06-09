import { mockedBody } from '../__mocks__/emailNotificationService';
// import { getInstitutionProductUserInfo, sendEmail } from '../__mocks__/emailNotificationService';
import { getInstitutionProductUserInfo, sendEmail } from '../emailNotificationService';
// import { EmailNotificationApiMocked } from '../../api/__mocks__/emeailNotificationApiClient';
import { EmailNotificationApiMocked } from '../../api/__mocks__/emailNotificationApiClient';

jest.mock('../../services/emailNotificationService');

beforeEach(() => {
  jest.spyOn(EmailNotificationApiMocked, 'getInstitutionProductUserInfo');
  jest.spyOn(EmailNotificationApiMocked, 'sendEmail');
});

test('test get Institution Product User Info', async () => {
  await getInstitutionProductUserInfo();
  expect(EmailNotificationApiMocked.getInstitutionProductUserInfo).toHaveBeenCalled();
});

test('test send email', async () => {
  await sendEmail(mockedBody);
  expect(EmailNotificationApiMocked.sendEmail).toHaveBeenCalledWith(mockedBody);
});
