import { Body, Controller, Get, Post, Query, UnauthorizedException } from '@nestjs/common';
import { CreatePayInUseCase } from '@src/domain/useCases/createPayIn.useCase';
import { CreatePayOutUseCase } from '@src/domain/useCases/createPayOut.UseCase';
import { ProviderResolver } from '@src/interface/http/provider.resolver';
import { PayInDto } from '@src/interface/http/dto/payIn.dto';
import { PayOutDto } from '@src/interface/http/dto/payOut.dto';
import { StatusQueryDto } from '@src/interface/http/dto/status.dto';
import { GetStatusUseCase } from '@src/domain/useCases/getStatus.useCase';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly payInUseCase: CreatePayInUseCase,
    private readonly payOutUseCase: CreatePayOutUseCase,
    private readonly providerResolver: ProviderResolver,
    private readonly statusUseCase: GetStatusUseCase,
  ) {}

  @Post('pay-in')
  async payIn(@Body() dto: PayInDto, @Query('provider') provider?: string) {
    const gateway = this.providerResolver.resolve(provider);

    const result = await this.payInUseCase.exec(gateway, {
      amount: dto.amount,
      currency: dto.currency,
      description: dto.description,
    });

    if (result.isErr()) {
      throw new UnauthorizedException(result.err());
    }

    return result.ok();
  }

  @Post('pay-out')
  async payOut(@Body() dto: PayOutDto, @Query('provider') provider?: string) {
    const gateway = this.providerResolver.resolve(provider);

    const result = await this.payOutUseCase.exec(gateway, {
      amount: dto.amount,
      currency: dto.currency,
      receiver: dto.receiver,
      description: dto.description,
    });

    if (result.isErr()) {
      throw new UnauthorizedException(result.err());
    }

    return result.ok();
  }

  @Get('status')
  async status(@Query() q: StatusQueryDto, @Query('provider') provider?: string) {
    const gateway = this.providerResolver.resolve(provider);
    const result = await this.statusUseCase.exec(gateway, q.id);

    if (result.isErr()) {
      throw new UnauthorizedException(result.err());
    }

    return result.ok();
  }
}
