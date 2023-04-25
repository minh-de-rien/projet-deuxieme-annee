import { InterfaceScore } from '@common/interface/interface-score';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type ScoreDocument = Score & Document;

@Schema()
export class Score {
    @ApiProperty()
    _id?: number;

    @ApiProperty()
    @Prop({ required: true })
    nomJeu: string;

    @ApiProperty()
    @Prop({ required: true })
    meilleursTempsSolo: InterfaceScore[];

    @ApiProperty()
    @Prop({ required: true })
    meilleursTemps1v1: InterfaceScore[];
}

export const scoreSchema = SchemaFactory.createForClass(Score);
