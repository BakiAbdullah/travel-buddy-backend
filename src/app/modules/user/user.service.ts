import { Prisma, User, UserRole, UserStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { Request } from "express";
import config from "../../../config";
import { prisma } from "../../../shared/prismaInstance";
import { fileUploaderUtils } from "../../../helpers/fileUploader";
import { IAuthUser } from "../../interfaces/user";
import { paginationHelper } from "../../../helpers/paginationHelper";
import { IPaginationOptions } from "../../interfaces/pagination";
import { userSearchAbleFields } from "./user.constant";

const createAdmin = async (req: Request): Promise<User> => {
  const file = req.file;

  if (file) {
    const uploadToCloudinary = await fileUploaderUtils.uploadToCloudinary(file);
    req.body.admin.profileImage = uploadToCloudinary?.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(
    req.body.password,
    Number(config.bcrypt_salt_rounds)
  );

  const userData = {
    name: req.body.admin.name,
    email: req.body.admin.email,
    password: hashedPassword,
    contactNumber: req.body.admin.contactNumber,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (tnx) => {
    return await tnx.user.create({
      data: userData,
    });
  });

  return result;
};

// Create User
const createUser = async (req: Request): Promise<User> => {
  const file = req.file;

  if (file) {
    const uploadToCloudinary = await fileUploaderUtils.uploadToCloudinary(file);
    req.body.user.profileImage = uploadToCloudinary?.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(
    req.body.password,
    Number(config.bcrypt_salt_rounds)
  );

  const userData = {
    name: req.body.user.name,
    email: req.body.user.email,
    password: hashedPassword,
    contactNumber: req.body.user.contactNumber,
    role: UserRole.USER,
  };

  const result = await prisma.$transaction(async (tnx) => {
    // Step 1: Create user
    return await tnx.user.create({
      data: userData,
    });
  });

  return result;
};

// Update profile
const updateMyProfie = async (user: IAuthUser, req: Request) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
    },
  });


  const file = req.file;

  // File upload
  if (file) {
    const uploadToCloudinary = await fileUploaderUtils.uploadToCloudinary(file);
    req.body.profileImage = uploadToCloudinary?.secure_url;
  }

  let profileInfo;

  if (userInfo.role === UserRole.ADMIN) {
    profileInfo = await prisma.user.update({
      where: {
        email: userInfo.email,
      },
      data: req.body,
    });
  } else if (userInfo.role === UserRole.USER) {
    // Merge travelInterests only if user sends it
    if (req.body.travelInterests) {
      // Convert to array if single string given
      const newInterests = Array.isArray(req.body.travelInterests)
        ? req.body.travelInterests
        : [req.body.travelInterests];

      req.body.travelInterests = [
        ...(userInfo.travelInterests ?? []),
        ...newInterests,
      ];
    }

    // Merge visitedCountries
    if (req.body.visitedCountries) {
      // Convert to array if single string given
      const newCountries = Array.isArray(req.body.visitedCountries)
        ? req.body.visitedCountries
        : [req.body.visitedCountries];

      req.body.visitedCountries = [
        ...(userInfo.visitedCountries ?? []),
        ...newCountries,
      ];
    }

    profileInfo = await prisma.user.update({
      where: {
        email: userInfo.email,
      },
      data: req.body,
    });
  }


  return { ...profileInfo };
};

const getAllUsersFromDB = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (params.searchTerm) {
    andConditions.push({
      OR: userSearchAbleFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.user.findMany({
    where: whereConditions && { role: UserRole.USER },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      needPasswordChange: true,
      status: true,
      profileImage: true,
      travelInterests: true,
      travelPlans: true,
      visitedCountries: true,
      reviewsGiven: true,
      reviewsReceived: true,
      rating: true,
      contactNumber: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const total = await prisma.user.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSingleUserFromDB = async (id: string): Promise<any> => {
  const result = await prisma.user.findUniqueOrThrow({
    where: {
      id,
      role: UserRole.USER
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      needPasswordChange: true,
      status: true,
      profileImage: true,
      travelInterests: true,
      travelPlans: true,
      visitedCountries: true,
      reviewsGiven: true,
      reviewsReceived: true,
      rating: true,
      contactNumber: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  return result;
};

// const changeProfileStatus = async (id: string, status: UserRole) => {
//   const userData = await prisma.user.findUniqueOrThrow({
//     where: {
//       id,
//     },
//   });

//   const updateUserStatus = await prisma.user.update({
//     where: {
//       id,
//     },
//     data: status,
//   });

//   return updateUserStatus;
// };

// const getMyProfile = async (user: IAuthUser) => {
//   const userInfo = await prisma.user.findUniqueOrThrow({
//     where: {
//       email: user?.email,
//       status: UserStatus.ACTIVE,
//     },
//     select: {
//       id: true,
//       email: true,
//       needPasswordChange: true,
//       role: true,
//       status: true,
//     },
//   });

//   let profileInfo;

//   if (userInfo.role === UserRole.SUPER_ADMIN) {
//     profileInfo = await prisma.admin.findUnique({
//       where: {
//         email: userInfo.email,
//       },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         profilePhoto: true,
//         contactNumber: true,
//         isDeleted: true,
//         createdAt: true,
//         updatedAt: true,
//       },
//     });
//   } else if (userInfo.role === UserRole.ADMIN) {
//     profileInfo = await prisma.admin.findUnique({
//       where: {
//         email: userInfo.email,
//       },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         profilePhoto: true,
//         contactNumber: true,
//         isDeleted: true,
//         createdAt: true,
//         updatedAt: true,
//       },
//     });
//   } else if (userInfo.role === UserRole.DOCTOR) {
//     profileInfo = await prisma.doctor.findUnique({
//       where: {
//         email: userInfo.email,
//       },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         profilePhoto: true,
//         contactNumber: true,
//         address: true,
//         registrationNumber: true,
//         experience: true,
//         gender: true,
//         appointmentFee: true,
//         qualification: true,
//         currentWorkingPlace: true,
//         designation: true,
//         averageRating: true,
//         isDeleted: true,
//         createdAt: true,
//         updatedAt: true,
//         doctorSpecialties: {
//           include: {
//             specialities: true,
//           },
//         },
//       },
//     });
//   } else if (userInfo.role === UserRole.PATIENT) {
//     profileInfo = await prisma.patient.findUnique({
//       where: {
//         email: userInfo.email,
//       },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         profilePhoto: true,
//         contactNumber: true,
//         address: true,
//         isDeleted: true,
//         createdAt: true,
//         updatedAt: true,
//         patientHealthData: true,
//         medicalReport: {
//           select: {
//             id: true,
//             patientId: true,
//             reportName: true,
//             reportLink: true,
//             createdAt: true,
//             updatedAt: true,
//           },
//         },
//       },
//     });
//   }

//   return { ...userInfo, ...profileInfo };
// };

// const updateMyProfie = async (user: IAuthUser, req: Request) => {
//   const userInfo = await prisma.user.findUniqueOrThrow({
//     where: {
//       email: user?.email,
//       status: UserStatus.ACTIVE,
//     },
//   });

//   const file = req.file;
//   if (file) {
//     const uploadToCloudinary = await fileUploaderUtils.uploadToCloudinary(file);
//     req.body.profilePhoto = uploadToCloudinary?.secure_url;
//   }

//   let profileInfo;

//   if (userInfo.role === UserRole.SUPER_ADMIN) {
//     profileInfo = await prisma.admin.update({
//       where: {
//         email: userInfo.email,
//       },
//       data: req.body,
//     });
//   } else if (userInfo.role === UserRole.ADMIN) {
//     profileInfo = await prisma.admin.update({
//       where: {
//         email: userInfo.email,
//       },
//       data: req.body,
//     });
//   } else if (userInfo.role === UserRole.DOCTOR) {
//     profileInfo = await prisma.doctor.update({
//       where: {
//         email: userInfo.email,
//       },
//       data: req.body,
//     });
//   } else if (userInfo.role === UserRole.PATIENT) {
//     profileInfo = await prisma.patient.update({
//       where: {
//         email: userInfo.email,
//       },
//       data: req.body,
//     });
//   }

//   return { ...profileInfo };
// };

export const userService = {
  createAdmin,
  createUser,
  updateMyProfie,
  getAllUsersFromDB,
  getSingleUserFromDB,
};
