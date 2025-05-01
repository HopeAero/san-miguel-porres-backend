import {
  decimalToString,
  DecimalTransformer,
} from '@/common/transformers/decimal.transformer';
import { Transform } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import Decimal from 'decimal.js';
import { Employee } from '@/core/people/employee/entities/employee.entity';

@Entity({ name: 'contracts' })
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Employee, (employee) => employee.contract, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  employee: Relation<Employee>;

  @Column()
  dni: string;

  @Column({ type: 'text' })
  position: string;

  @Column({ type: 'text' })
  category: string;

  @Column({ type: 'text' })
  level: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 0,
    default: 0,
    transformer: new DecimalTransformer(),
  })
  @Transform(decimalToString, { toPlainOnly: true })
  workingHours: Decimal;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 0,
    default: 0,
    transformer: new DecimalTransformer(),
  })
  @Transform(decimalToString, { toPlainOnly: true })
  hoursWorked: Decimal;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 0,
    default: 0,
    transformer: new DecimalTransformer(),
  })
  @Transform(decimalToString, { toPlainOnly: true })
  hourlyCost: Decimal;

  @Column({
    type: 'integer',
    default: 0,
  })
  yearsOfService: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 0,
    default: 0,
    transformer: new DecimalTransformer(),
  })
  @Transform(decimalToString, { toPlainOnly: true })
  monthlySalary: Decimal;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 0,
    default: 0,
    transformer: new DecimalTransformer(),
  })
  @Transform(decimalToString, { toPlainOnly: true })
  hierarchy: Decimal;

  @Column({
    type: 'boolean',
  })
  transport: boolean;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 0,
    default: 0,
    transformer: new DecimalTransformer(),
  })
  @Transform(decimalToString, { toPlainOnly: true })
  antique: Decimal;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 0,
    default: 0,
    transformer: new DecimalTransformer(),
  })
  @Transform(decimalToString, { toPlainOnly: true })
  teachingExercise: Decimal;

  @Column({
    type: 'integer',
    default: 0,
  })
  nroOfChildren: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 0,
    default: 0,
    transformer: new DecimalTransformer(),
  })
  @Transform(decimalToString, { toPlainOnly: true })
  postgraduate: Decimal;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 0,
    default: 0,
    transformer: new DecimalTransformer(),
  })
  @Transform(decimalToString, { toPlainOnly: true })
  bonusForChildren: Decimal;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 0,
    default: 0,
    transformer: new DecimalTransformer(),
  })
  @Transform(decimalToString, { toPlainOnly: true })
  geography: Decimal;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 0,
    default: 0,
    transformer: new DecimalTransformer(),
  })
  @Transform(decimalToString, { toPlainOnly: true })
  homeCareAssistance: Decimal;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 0,
    default: 0,
    transformer: new DecimalTransformer(),
  })
  @Transform(decimalToString, { toPlainOnly: true })
  bonusDisability: Decimal;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 0,
    default: 0,
    transformer: new DecimalTransformer(),
  })
  @Transform(decimalToString, { toPlainOnly: true })
  totalSalary: Decimal;
}
