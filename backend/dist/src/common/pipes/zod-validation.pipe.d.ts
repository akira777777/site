import { PipeTransform } from '@nestjs/common';
import type { ZodSchema } from 'zod';
export declare class ZodValidationPipe<TInput, TOutput> implements PipeTransform<TInput, TOutput> {
    private readonly schema;
    constructor(schema: ZodSchema<TOutput>);
    transform(value: TInput): TOutput;
}
