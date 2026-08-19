import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TracksModule } from './tracks/tracks.module';
import { PurchasesModule } from './purchases/purchases.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [AuthModule, UsersModule, TracksModule, PurchasesModule, StorageModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
