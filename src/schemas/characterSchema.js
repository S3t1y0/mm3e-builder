import * as v from 'valibot';

/**
 * Character Import Validation Schema
 * Ensures imported JSON possesses the minimal required M&M 3e character structure.
 */
export const CharacterImportSchema = v.pipe(
  v.unknown(),
  v.check((input) => typeof input === 'object' && input !== null, 'Data must be a valid JSON object'),
  v.check((input) => {
    return Boolean(
      input.abilities ||
      input.powers ||
      input.name ||
      input.powerLevel ||
      input.defensesBought
    );
  }, 'Invalid M&M 3e format: Missing character attributes (abilities, powers, or name)')
);

/**
 * Power Effect Schema
 * Validates individual effect structure in custom powers.
 */
export const EffectSchema = v.object({
  id: v.fallback(v.string(), () => 'eff_' + Date.now()),
  name: v.fallback(v.string(), 'Damage'),
  baseEffect: v.fallback(v.string(), 'Damage'),
  ranks: v.fallback(v.number(), 1),
  baseCost: v.fallback(v.number(), 1),
  action: v.fallback(v.string(), 'Standard'),
  range: v.fallback(v.string(), 'Close'),
  duration: v.fallback(v.string(), 'Instant'),
  resistance: v.fallback(v.string(), 'Toughness'),
  extras: v.fallback(v.array(v.any()), []),
  flaws: v.fallback(v.array(v.any()), []),
  config: v.fallback(v.record(v.string(), v.any()), {})
});

/**
 * Validates raw import payload safely with human-readable error messages.
 */
export function validateCharacterImport(raw) {
  const result = v.safeParse(CharacterImportSchema, raw);
  if (!result.success) {
    const issue = result.issues?.[0];
    return {
      isValid: false,
      error: issue ? issue.message : 'Invalid character data format',
      data: null
    };
  }
  return {
    isValid: true,
    error: null,
    data: result.output
  };
}
