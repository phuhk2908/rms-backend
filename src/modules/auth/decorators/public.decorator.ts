import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
// Decorator to mark a route as public (no authentication required)
// Usage: @Public() on a controller method or class
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
