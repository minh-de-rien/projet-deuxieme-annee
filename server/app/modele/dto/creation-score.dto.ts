import { InterfaceScore } from '@common/interface/interface-score';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreationScoreDto {
    @ApiProperty()
    @IsString()
    nomJeu: string;

    @ApiProperty()
    @IsNumber()
    meilleursTempsSolo: InterfaceScore[];

    @ApiProperty()
    @IsNumber()
    meilleursTemps1v1: InterfaceScore[];
}
