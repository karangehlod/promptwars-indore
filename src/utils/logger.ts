export class Logger {
  static init(message: string) {
    console.log(`[INIT] %c${message}`, 'color: #3b82f6; font-weight: bold;');
  }

  static input(message: string) {
    console.log(`[INPUT] %c${message}`, 'color: #8b5cf6; font-weight: bold;');
  }

  static ai(message: string) {
    console.log(`[AI] %c${message}`, 'color: #10b981; font-weight: bold;');
  }

  static store(message: string) {
    console.log(`[STORE] %c${message}`, 'color: #f59e0b; font-weight: bold;');
  }

  static error(message: string) {
    console.error(`[ERROR] %c${message}`, 'color: #ef4444; font-weight: bold;');
  }

  static retry(message: string) {
    console.warn(`[RETRY] %c${message}`, 'color: #f97316; font-weight: bold;');
  }

  static cache(message: string) {
    console.log(`[CACHE] %c${message}`, 'color: #06b6d4; font-weight: bold;');
  }
}
