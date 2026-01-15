export interface UpdateUserDto {
  name?: string;
}

export interface CreateUserDto {
  clerk_user_id: string;
  email: string;
  name?: string;
}
