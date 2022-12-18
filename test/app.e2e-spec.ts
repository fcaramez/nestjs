import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { faker } from '@faker-js/faker';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });
  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    describe('Signup', () => {
      it('Should signup', () => {
        const email = faker.internet.email();
        const password = faker.internet.password(12);
        const dto = { email, password };
        return pactum
          .spec()
          .post('/auth/signup ')
          .withBody(dto)
          .expectStatus(201);
      });
    });
    describe('Login', () => {
      it.todo('Should login');
    });
  });
  describe('User', () => {
    describe('Get me', () => {
      it.todo('Should get the User');
    });
    describe('Edit user', () => {
      it.todo('Should edit the User');
    });
  });
  describe('Bookmarks', () => {
    describe('Create bookmark', () => {
      it.todo('Should create the bookmark');
    });
    describe('Get bookmarks', () => {
      it.todo('Should get the bookmarks');
    });
    describe('Get bookmark by id', () => {
      it.todo('Should get bookmark by id');
    });
    describe('Edit bookmark', () => {
      it.todo('Should edit bookmark');
    });
    describe('Delete bookmark by id', () => {
      it.todo('Should delete bookmark');
    });
  });
});
