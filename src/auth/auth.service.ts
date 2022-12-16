import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  signup() {
    return 'I am Signing in';
  }
  login() {
    return 'I am Logging in';
  }
}
