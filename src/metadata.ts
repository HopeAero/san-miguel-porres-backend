/* eslint-disable */
export default async () => {
    const t = {
        ["./common/enum/role"]: await import("./common/enum/role"),
        ["./common/dto/page.option.dto"]: await import("./common/dto/page.option.dto"),
        ["./core/people/people/entities/person.entity"]: await import("./core/people/people/entities/person.entity"),
        ["./core/people/representative/entities/representative.entity"]: await import("./core/people/representative/entities/representative.entity"),
        ["./core/people/student/entities/student.entity"]: await import("./core/people/student/entities/student.entity"),
        ["./core/people/employee/entities/employee.entity"]: await import("./core/people/employee/entities/employee.entity"),
        ["./core/schoolar-year/entities/lapse.entity"]: await import("./core/schoolar-year/entities/lapse.entity"),
        ["./core/schoolar-year/entities/schoolar-year.entity"]: await import("./core/schoolar-year/entities/schoolar-year.entity"),
        ["./core/schoolar-year/entities/school-court.entity"]: await import("./core/schoolar-year/entities/school-court.entity"),
        ["./core/schoolar-year/dto/create-scholar-court.dto"]: await import("./core/schoolar-year/dto/create-scholar-court.dto"),
        ["./core/schoolar-year/dto/create-schoolar-year.dto"]: await import("./core/schoolar-year/dto/create-schoolar-year.dto"),
        ["./core/schoolar-year/dto/create-lapse.dto"]: await import("./core/schoolar-year/dto/create-lapse.dto"),
        ["./core/users/entities/user.entity"]: await import("./core/users/entities/user.entity"),
        ["./core/users/dto/user.dto"]: await import("./core/users/dto/user.dto"),
        ["./core/courses/entities/course.entity"]: await import("./core/courses/entities/course.entity"),
        ["./core/people/representative/dto/representative.dto"]: await import("./core/people/representative/dto/representative.dto"),
        ["./core/people/student/dto/student"]: await import("./core/people/student/dto/student"),
        ["./core/people/employee/dto/employee"]: await import("./core/people/employee/dto/employee"),
        ["./schoolar-year/entities/schoolar-year.entity"]: await import("./schoolar-year/entities/schoolar-year.entity")
    };
    return { "@nestjs/swagger": { "models": [[import("./core/users/entities/user.entity"), { "User": { id: { required: true, type: () => Number }, name: { required: true, type: () => String }, email: { required: true, type: () => String }, password: { required: true, type: () => String }, role: { required: true, type: () => String }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date }, deleteAt: { required: true, type: () => Date } } }], [import("./core/users/dto/create-user.dto"), { "CreateUserDto": { name: { required: true, type: () => String }, email: { required: true, type: () => String }, password: { required: true, type: () => String }, role: { required: true, enum: t["./common/enum/role"].Role } } }], [import("./core/users/dto/update-user.dto"), { "UpdateUserDto": { name: { required: true, type: () => String }, email: { required: true, type: () => String }, password: { required: false, type: () => String }, role: { required: false, enum: t["./common/enum/role"].Role } } }], [import("./common/dto/page.option.dto"), { "PageOptionsDto": { order: { required: false, enum: t["./common/dto/page.option.dto"].Order }, page: { required: false, type: () => Number, default: 1, minimum: 1 }, perPage: { required: false, type: () => Number, default: 10, minimum: 1, maximum: 50 } } }], [import("./common/dto/page.dto"), { "PageDto": { items: { required: true }, paginate: { required: true, type: () => ({ page: { required: true, type: () => Number }, perPage: { required: true, type: () => Number }, totalItems: { required: true, type: () => Number }, totalPages: { required: true, type: () => Number }, hasPreviousPage: { required: true, type: () => Boolean }, hasNextPage: { required: true, type: () => Boolean } }) } } }], [import("./core/users/dto/user.dto"), { "UserDTO": { id: { required: true, type: () => Number }, name: { required: true, type: () => String }, email: { required: true, type: () => String }, role: { required: true, enum: t["./common/enum/role"].Role }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date }, deleteAt: { required: true, type: () => Date, nullable: true } } }], [import("./core/auth/dto/login.dto"), { "LoginCredentials": { email: { required: true, type: () => String }, password: { required: true, type: () => String } } }], [import("./core/auth/dto/register.dto"), { "RegistrationCredentials": { name: { required: true, type: () => String }, email: { required: true, type: () => String }, password: { required: true, type: () => String } } }], [import("./core/people/people/dto/create-person.dto"), { "CreatePersonDto": { dni: { required: true, type: () => String }, name: { required: true, type: () => String }, lastName: { required: true, type: () => String }, phone: { required: true, type: () => String }, direction: { required: true, type: () => String }, birthDate: { required: true, type: () => Date } } }], [import("./core/people/people/dto/update-person.dto"), { "UpdatePersonDto": {} }], [import("./core/people/student/entities/student.entity"), { "Student": { id: { required: true, type: () => Number }, person: { required: true, type: () => t["./core/people/people/entities/person.entity"].Person }, representative: { required: true, type: () => t["./core/people/representative/entities/representative.entity"].Representative }, deletedAt: { required: true, type: () => Date } } }], [import("./core/people/representative/entities/representative.entity"), { "Representative": { id: { required: true, type: () => Number }, person: { required: true, type: () => t["./core/people/people/entities/person.entity"].Person }, students: { required: true, type: () => [t["./core/people/student/entities/student.entity"].Student] }, deletedAt: { required: true, type: () => Date } } }], [import("./core/people/employee/entities/employee.entity"), { "Employee": { id: { required: true, type: () => Number }, employeeType: { required: true, enum: t["./core/people/employee/entities/employee.entity"].TypeEmployee }, person: { required: true, type: () => t["./core/people/people/entities/person.entity"].Person }, deletedAt: { required: true, type: () => Date } } }], [import("./core/people/people/entities/person.entity"), { "Person": { id: { required: true, type: () => Number }, dni: { required: true, type: () => String }, name: { required: true, type: () => String }, lastName: { required: true, type: () => String }, phone: { required: true, type: () => String }, direction: { required: true, type: () => String }, birthDate: { required: true, type: () => Date }, representative: { required: true, type: () => t["./core/people/representative/entities/representative.entity"].Representative }, student: { required: true, type: () => t["./core/people/student/entities/student.entity"].Student }, employee: { required: true, type: () => t["./core/people/employee/entities/employee.entity"].Employee }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date }, deletedAt: { required: true, type: () => Date } } }], [import("./core/courses/entities/course.entity"), { "Course": { id: { required: true, type: () => Number }, name: { required: true, type: () => String }, grade: { required: true, type: () => Number }, deletedAt: { required: true, type: () => Date } } }], [import("./core/courses/dto/create-course.dto"), { "CreateCourseDto": { name: { required: true, type: () => String }, grade: { required: true, type: () => Number, minimum: 1 } } }], [import("./core/courses/dto/update-course.dto"), { "UpdateCourseDto": {} }], [import("./core/people/representative/dto/create-representative.dto"), { "CreateRepresentativeDto": {} }], [import("./core/people/people/dto/person.dto"), { "PersonDto": { id: { required: true, type: () => Number }, dni: { required: true, type: () => String }, name: { required: true, type: () => String }, lastName: { required: true, type: () => String }, phone: { required: true, type: () => String }, direction: { required: true, type: () => String }, birthDate: { required: true, type: () => Date } } }], [import("./core/people/representative/dto/representative.dto"), { "RepresentativeDto": { students: { required: true, type: () => [t["./core/people/student/entities/student.entity"].Student] }, personId: { required: true, type: () => Number } } }], [import("./core/people/representative/dto/update-representative.dto"), { "UpdateRepresentativeDto": {} }], [import("./core/people/student/dto/create-student.dto"), { "CreateStudentDto": {} }], [import("./core/people/student/dto/update-student.dto"), { "UpdateStudentDto": {} }], [import("./core/people/employee/dto/create-employee.dto"), { "CreateEmployeeDTO": { employeeType: { required: true, enum: t["./core/people/employee/entities/employee.entity"].TypeEmployee } } }], [import("./core/people/employee/dto/update-employee.dto"), { "UpdateEmployeeDTO": {} }], [import("./core/schoolar-year/entities/school-court.entity"), { "SchoolCourt": { id: { required: true, type: () => Number }, courtNumber: { required: true, type: () => Number }, startDate: { required: true, type: () => String }, endDate: { required: true, type: () => String }, lapse: { required: true, type: () => t["./core/schoolar-year/entities/lapse.entity"].Lapse }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date }, deletedAt: { required: true, type: () => Date } } }], [import("./core/schoolar-year/entities/lapse.entity"), { "Lapse": { id: { required: true, type: () => String }, lapseNumber: { required: true, type: () => Number }, startDate: { required: true, type: () => String }, endDate: { required: true, type: () => String }, schoolYear: { required: true, type: () => t["./core/schoolar-year/entities/schoolar-year.entity"].SchoolarYear }, scholarCourts: { required: true, type: () => [t["./core/schoolar-year/entities/school-court.entity"].SchoolCourt] }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date }, deletedAt: { required: true, type: () => Date } } }], [import("./core/schoolar-year/entities/schoolar-year.entity"), { "SchoolarYear": { id: { required: true, type: () => Number }, code: { required: true, type: () => String }, startDate: { required: true, type: () => String }, endDate: { required: true, type: () => String }, lapses: { required: true, type: () => [t["./core/schoolar-year/entities/lapse.entity"].Lapse] }, deletedAt: { required: true, type: () => Date } } }], [import("./core/schoolar-year/dto/create-scholar-court.dto"), { "CreateScholarCourtDto": { startDate: { required: true, type: () => String }, endDate: { required: true, type: () => String } }, "UpdateCreateScholarCourtDto": { courtNumber: { required: true, type: () => Number }, startDate: { required: true, type: () => String }, endDate: { required: true, type: () => String } } }], [import("./core/schoolar-year/dto/create-lapse.dto"), { "CreateLapseDto": { startDate: { required: true, type: () => String }, endDate: { required: true, type: () => String }, scholarCourts: { required: true, type: () => [t["./core/schoolar-year/dto/create-scholar-court.dto"].CreateScholarCourtDto] } }, "UpdateCreateLapseDto": { lapseNumber: { required: true, type: () => Number }, startDate: { required: true, type: () => String }, endDate: { required: true, type: () => String }, scholarCourts: { required: true, type: () => [t["./core/schoolar-year/dto/create-scholar-court.dto"].UpdateCreateScholarCourtDto] } } }], [import("./core/schoolar-year/dto/create-schoolar-year.dto"), { "CreateSchoolarYearDto": { code: { required: true, type: () => String }, startDate: { required: true, type: () => String }, endDate: { required: true, type: () => String } } }], [import("./core/schoolar-year/dto/update-schoolar-year.dto"), { "UpdateSchoolarYearDto": { schoolarYear: { required: true, type: () => t["./core/schoolar-year/dto/create-schoolar-year.dto"].CreateSchoolarYearDto }, lapses: { required: true, type: () => [t["./core/schoolar-year/dto/create-lapse.dto"].UpdateCreateLapseDto] } } }], [import("./core/schoolar-year/dto/create-crud-of-crud.dto"), { "CreateCrudOfCrudSchoolarYearDto": { schoolarYear: { required: true, type: () => t["./core/schoolar-year/dto/create-schoolar-year.dto"].CreateSchoolarYearDto }, lapses: { required: true, type: () => [t["./core/schoolar-year/dto/create-lapse.dto"].CreateLapseDto] } } }], [import("./schoolar-year/entities/schoolar-year.entity"), { "SchoolarYear": { id: { required: true, type: () => Number }, code: { required: true, type: () => String }, startDate: { required: true, type: () => Date }, endDate: { required: true, type: () => Date }, deletedAt: { required: true, type: () => Date } } }], [import("./schoolar-year/dto/create-schoolar-year.dto"), { "CreateSchoolarYearDto": { code: { required: true, type: () => String }, startDate: { required: true, type: () => Date }, endDate: { required: true, type: () => Date } } }], [import("./schoolar-year/dto/update-schoolar-year.dto"), { "UpdateSchoolarYearDto": {} }]], "controllers": [[import("./app.controller"), { "AppController": { "getHello": { type: String } } }], [import("./core/auth/auth.controller"), { "AuthController": { "login": { type: Object }, "register": { type: Object } } }], [import("./core/users/users.controller"), { "UsersController": { "create": { type: t["./core/users/entities/user.entity"].User }, "findAll": { type: [t["./core/users/dto/user.dto"].UserDTO] }, "paginate": {}, "findOne": { type: t["./core/users/entities/user.entity"].User }, "update": { type: t["./core/users/entities/user.entity"].User }, "remove": {} } }], [import("./core/people/people/people.controller"), { "PersonasController": { "findAll": { type: [t["./core/people/people/entities/person.entity"].Person] }, "paginate": {}, "findOne": { type: t["./core/people/people/entities/person.entity"].Person }, "update": { type: Object }, "remove": {} } }], [import("./core/courses/courses.controller"), { "CoursesController": { "create": { type: t["./core/courses/entities/course.entity"].Course }, "update": { type: t["./core/courses/entities/course.entity"].Course }, "findOne": { type: t["./core/courses/entities/course.entity"].Course }, "paginate": {}, "remove": {} } }], [import("./core/people/representative/representative.controller"), { "RepresentativeController": { "create": { type: t["./core/people/representative/dto/representative.dto"].RepresentativeDto }, "findAll": { type: [t["./core/people/representative/dto/representative.dto"].RepresentativeDto] }, "paginate": {}, "findByName": { type: [t["./core/people/representative/dto/representative.dto"].RepresentativeDto] }, "findByDocument": { type: t["./core/people/representative/dto/representative.dto"].RepresentativeDto }, "searchRepresentatives": { type: [Object] }, "findOne": { type: t["./core/people/representative/dto/representative.dto"].RepresentativeDto }, "update": { type: t["./core/people/representative/dto/representative.dto"].RepresentativeDto }, "remove": {} } }], [import("./core/people/student/student.controller"), { "StudentController": { "create": { type: t["./core/people/student/dto/student"].StudentDto }, "findAll": { type: [t["./core/people/student/dto/student"].StudentDto] }, "paginate": {}, "findOne": { type: t["./core/people/student/dto/student"].StudentDto }, "update": { type: t["./core/people/student/dto/student"].StudentDto }, "remove": {} } }], [import("./core/people/employee/employee.controller"), { "EmployeeController": { "create": { type: t["./core/people/employee/dto/employee"].EmployeeDto }, "findAll": { type: [t["./core/people/employee/dto/employee"].EmployeeDto] }, "paginate": {}, "update": {}, "findOne": { type: t["./core/people/employee/dto/employee"].EmployeeDto }, "remove": {} } }], [import("./core/schoolar-year/schoolar-year.controller"), { "SchoolarYearController": { "create": { type: t["./core/schoolar-year/entities/schoolar-year.entity"].SchoolarYear }, "paginate": {}, "findAll": { type: [t["./core/schoolar-year/entities/schoolar-year.entity"].SchoolarYear] }, "update": { type: t["./core/schoolar-year/entities/schoolar-year.entity"].SchoolarYear }, "findOne": { type: t["./core/schoolar-year/entities/schoolar-year.entity"].SchoolarYear }, "remove": {} } }], [import("./schoolar-year/schoolar-year.controller"), { "SchoolarYearController": { "create": { type: t["./schoolar-year/entities/schoolar-year.entity"].SchoolarYear }, "update": { type: t["./schoolar-year/entities/schoolar-year.entity"].SchoolarYear }, "findOne": { type: t["./schoolar-year/entities/schoolar-year.entity"].SchoolarYear }, "paginate": {}, "remove": {} } }]] } };
};