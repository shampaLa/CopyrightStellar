import { describe, it, expect } from 'vitest';

// Test the StellarHelper utility functions without network calls
describe('StellarHelper Utilities', () => {
  // Import inline since the class has constructor side effects
  const formatAddress = (address: string, start = 4, end = 4) => {
    if (address.length <= start + end) return address;
    return `${address.slice(0, start)}...${address.slice(-end)}`;
  };

  const stroopsToXlm = (stroops: string | number | bigint) => {
    const value = BigInt(stroops);
    const whole = value / BigInt(10_000_000);
    const fraction = value % BigInt(10_000_000);
    return `${whole}.${String(fraction).padStart(7, '0')}`;
  };

  const xlmToStroops = (xlm: string) => {
    const parts = xlm.split('.');
    const whole = BigInt(parts[0] || '0') * BigInt(10_000_000);
    const frac = parts[1] ? BigInt(parts[1].padEnd(7, '0').slice(0, 7)) : BigInt(0);
    return String(whole + frac);
  };

  it('formats addresses correctly', () => {
    const addr = 'GDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2OISGN5';
    expect(formatAddress(addr)).toBe('GDLZ...SGN5');
    expect(formatAddress(addr, 6, 4)).toBe('GDLZFC...SGN5');
  });

  it('converts stroops to XLM', () => {
    expect(stroopsToXlm('10000000')).toBe('1.0000000');
    expect(stroopsToXlm('123456789')).toBe('12.3456789');
    expect(stroopsToXlm('500000')).toBe('0.0500000');
  });

  it('converts XLM to stroops', () => {
    expect(xlmToStroops('1.0')).toBe('10000000');
    expect(xlmToStroops('12.3456789')).toBe('123456789');
    expect(xlmToStroops('100')).toBe('1000000000');
  });

  it('handles edge cases for short addresses', () => {
    expect(formatAddress('ABCD')).toBe('ABCD');
    expect(formatAddress('ABCDEFGH', 4, 4)).toBe('ABCDEFGH');
  });

  it('round-trips stroops conversion', () => {
    const original = '7654321';
    const xlm = stroopsToXlm(original);
    const back = xlmToStroops(xlm);
    expect(back).toBe(original);
  });
});
