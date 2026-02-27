import { describe, expect, it } from 'vitest';
import { matchIntent, resolvePackById, resolveRichContent } from '../content-resolver';

describe('content-resolver', () => {
  it('resolves exact pack by explicit command', () => {
    const result = resolveRichContent({
      sessionKind: 'topic',
      message: '@content:hooks-lifecycle-map',
      topicTitle: 'useEffect',
    });

    expect(result.source).toBe('explicit');
    expect(result.rich?.length).toBeGreaterThan(0);
  });

  it('returns explicit response with no rich content for unknown pack', () => {
    const result = resolveRichContent({
      sessionKind: 'topic',
      message: '@content:does-not-exist',
      topicTitle: 'useEffect',
    });

    expect(result.source).toBe('explicit');
    expect(result.rich).toBeUndefined();
    expect(result.text).toContain('couldn\'t find content pack');
  });

  it('matches tradeoff intent', () => {
    const match = matchIntent('Can you give me a vs comparison and tradeoff?');
    expect(match?.packId).toBe('state-vs-reducer-tradeoff');
  });

  it('matches debug stale closure intent', () => {
    const match = matchIntent('why rerender stale closure debug trace');
    expect(match?.packId).toBe('stale-closure-debug-trace');
  });

  it('returns none when no explicit or intent match exists', () => {
    const result = resolveRichContent({
      sessionKind: 'main',
      message: 'hello there',
    });

    expect(result.source).toBe('none');
    expect(result.rich).toBeUndefined();
  });

  it('gives explicit precedence over intent', () => {
    const result = resolveRichContent({
      sessionKind: 'topic',
      message: '@content:hooks-lifecycle-map compare useState vs reducer',
      topicTitle: 'useState',
    });

    expect(result.source).toBe('explicit');
    expect(result.text).toContain('Loaded');
    expect(result.rich).toEqual(resolvePackById('hooks-lifecycle-map'));
  });
});
