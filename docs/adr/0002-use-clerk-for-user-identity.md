# Use Clerk for User identity and sessions

We will use Clerk as the managed User service for sign-up, sign-in, sessions, and stable external User IDs. Todo by AI will use the authenticated Clerk User ID as the External User Link for Task ownership, while storing no local User profile until the product has specific User properties to own. We chose Clerk over Supabase Auth, Auth0, and Better Auth because this app needs hosted identity with minimal local User state rather than a broader backend platform, enterprise identity suite, or self-managed auth stack.
