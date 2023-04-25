import { InterfaceScore } from '@common/interface/interface-score';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ModificationScoreDto {
    @ApiProperty()
    @IsString()
    nomJeu: string;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    meilleursTempsSolo?: InterfaceScore[];

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    meilleursTemps1v1?: InterfaceScore[];
}
