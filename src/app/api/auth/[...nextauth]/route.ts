// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// 許可するメールアドレスのリストを環境変数から取得
const allowedUsers = process.env.ALLOWED_USERS?.split(',') || [];

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  // 認証後のコールバック設定
  callbacks: {
    // signInコールバック: ログイン直後の認可処理
    async signIn({ account, profile }) {
      // Googleアカウントでのログイン時のみ処理
      if (account?.provider === 'google') {
        const userEmail = profile?.email;
        // ユーザーのメールアドレスが許可リストに含まれているか確認
        if (userEmail && allowedUsers.includes(userEmail)) {
          console.log(`アクセス許可: ${userEmail}`);
          return true; // アクセスを許可
        }
        console.log(`アクセス拒否: ${userEmail}`);
        return false; // アクセスを拒否
      }
      return false; // その他のプロバイダは拒否
    },
  },
  // ログイン失敗時のリダイレクト先
  pages: {
    signIn: '/login', // ログインページ（後述）
    error: '/error', // ログイン失敗時のエラーページ（後述）
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
