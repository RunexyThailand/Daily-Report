import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

type userType = Prisma.UserUpdateInput;

const userRouter = router({
  updateUser: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        currentPassword: z.string().optional(),
        newPassword: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const data: userType = {
          name: input.name,
        };
        if (input.newPassword) {
          const currentUserInfo = await ctx.prisma.user.findUniqueOrThrow({
            where: { id: ctx.session?.user?.id },
          });
          const checkOriginalPassword = await bcrypt.compare(
            input.currentPassword || "",
            currentUserInfo.password || "",
          );
          if (!checkOriginalPassword) {
            throw new Error("Current password is incorrect");
          }
          data.password = await bcrypt.hash(input.newPassword, 10);
        }

        const updated = await ctx.prisma.user.update({
          where: { id: ctx.session?.user?.id },
          data: data,
        });
        return updated;
      } catch (err) {
        throw err;
      }
    }),
});

export default userRouter;
