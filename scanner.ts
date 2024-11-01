import { Token, TokenType } from "./token.ts";
import { error } from "./errors.ts";
export default class Scanner {
    private source: string;
    private tokens: Array<Token> = new Array<Token>;
    private start: number = 0;
    private current: number = 0;
    private line: number = 1;

    private keywords: { [key: string]: TokenType } = {
        and: TokenType.AND,
        class: TokenType.CLASS,
        else: TokenType.ELSE,
        false: TokenType.FALSE,
        for: TokenType.FOR,
        fun: TokenType.FUN,
        if: TokenType.IF,
        nil: TokenType.NIL,
        or: TokenType.OR,
        print: TokenType.PRINT,
        return: TokenType.RETURN,
        super: TokenType.SUPER,
        this: TokenType.THIS,
        true: TokenType.TRUE,
        var: TokenType.VAR,
        while: TokenType.WHILE
    };

    constructor(source: string){
        this.source = source;
    }

    scanTokens(): Array<Token> {
        while(!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken();
        }
        this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
        return this.tokens;
    }

    private isAtEnd(): boolean {
        return this.current >= this.source.length;
    }

    private scanToken(): void {
        const c: string = this.advance();
        switch (c) {
            case '(': this.addToken(TokenType.LEFT_PAREN); break;
            case ')': this.addToken(TokenType.RIGHT_PAREN); break;
            case '{': this.addToken(TokenType.LEFT_BRACE); break;
            case '}': this.addToken(TokenType.RIGHT_BRACE); break;
            case ',': this.addToken(TokenType.COMMA); break;
            case '.': this.addToken(TokenType.DOT); break;
            case '-': this.addToken(TokenType.MINUS); break;
            case '+': this.addToken(TokenType.PLUS); break;
            case ';': this.addToken(TokenType.SEMICOLON); break;
            case '*': this.addToken(TokenType.STAR); break;
            case '!':
                this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
                break;
            case '=':
                this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
                break;
            case '<':
                this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
                break;
            case '>':
                this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
                break;
            case '/':
                if (this.match('/')) {
                // A comment goes until the end of the line.
                while (this.peek() != '\n' && !this.isAtEnd()) this.advance();
                } else {
                    this.addToken(TokenType.SLASH);
                }
                break;
            case ' ':
            case '\r':
            case '\t':
                break;
            case '\n':
                this.line++;
                break;
            case '"':
                this.string();
                break;
            default:
                if(this.isDigit(c)) {
                    this.number();
                } else if(this.isAlpha(c)) {
                    this.identifier();
                } else {
                    error(this.line, "Unexpected character.")
                }
                break;
            }
    }

    private advance(): string {
        this.current++;
        return this.source[this.current - 1];
    }

    private addToken(type: TokenType, literal: string | number | object | null = null): void {
        const text: string = this.source.slice(this.start, this.current);
        this.tokens.push(new Token(type, text, literal, this.line));
    }

    private match(expected: string): boolean {
        if (this.isAtEnd()) return false;
        if (this.source[this.current] != expected) return false;
        this.current++;
        return true;
    }

    private peek(): string {
        if (this.isAtEnd()) return '\0';
        return this.source[this.current];
    }

    private string() {
        while (this.peek() != '"' && !this.isAtEnd()) {
            if (this.peek() == '\n') this.line++;
            this.advance();
        }
        if (this.isAtEnd()) {
            error(this.line, "Unterminated string.");
            return;
        }
        this.advance();
        const value: string = this.source.slice(this.start + 1, this.current - 1);
        this.addToken(TokenType.STRING, value);
    }

    private isDigit(c: string): boolean {
        return c >= '0' && c <= '9';
    }

    private number(): void {
        while (this.isDigit(this.peek())) this.advance();
            if (this.peek() == '.' && this.isDigit(this.peekNext())) {
            this.advance();
            while (this.isDigit(this.peek())) this.advance();
        }
        this.addToken(TokenType.NUMBER, parseFloat(this.source.slice(this.start, this.current)));
    }

    private peekNext() {
        if (this.current + 1 >= this.source.length) return '\0';
        return this.source[this.current + 1];
    }

    private identifier() {
        while (this.isAlphaNumeric(this.peek())) this.advance();
        const text: string = this.source.slice(this.start, this.current);
        let type: TokenType = this.keywords[text];
        if (!type) type = TokenType.IDENTIFIER;
        this.addToken(type);
    }

    private isAlpha(c: string): boolean {
        return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_';
    }

    private isAlphaNumeric(c: string): boolean {
        return this.isAlpha(c) || this.isDigit(c);
    }
}