import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  OneToMany,
  Relation,
} from 'typeorm';
import { SchoolLapse } from './school-lapse.entity';
import { CourseSchoolYear } from './course-school-year.entity';

@Entity('school_years')
export class SchoolYear {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @OneToMany(() => SchoolLapse, (schoolLapse) => schoolLapse.schoolYear, {
    onDelete: 'CASCADE',
  })
  schoolLapses: Relation<SchoolLapse[]>;

  @OneToMany(
    () => CourseSchoolYear,
    (courseSchoolYear) => courseSchoolYear.schoolYear,
    {
      cascade: true,
    },
  )
  courseSchoolYears: Relation<CourseSchoolYear[]>;

  @DeleteDateColumn()
  deletedAt: Date;
}
