import {
  complianceFlagsFromItem,
  complianceFormValuesFromData,
  complianceKeyToUrlSlug,
  complianceLabelForKey,
  compliancePayloadFromForm,
  complianceUrlSlugToKey,
  isComplianceTrue,
} from '@/utils/compliance';

describe('compliance helpers', () => {
  it('normalizes truthy flag representations', () => {
    expect(isComplianceTrue(true)).toBe(true);
    expect(isComplianceTrue(1)).toBe(true);
    expect(isComplianceTrue('1')).toBe(true);
    expect(isComplianceTrue('true')).toBe(true);
    expect(isComplianceTrue('false')).toBe(false);
    expect(isComplianceTrue(undefined)).toBe(false);
  });

  it('reads snake_case and camelCase fields', () => {
    expect(complianceFlagsFromItem({ cec_listed: '1', feocCompliant: true })).toEqual({
      cec_listed: true,
      feoc_compliant: true,
    });
  });

  it('maps between API, form, and payload shapes', () => {
    expect(complianceFormValuesFromData({ cec_listed: 'true' })).toEqual({
      cec_listed: true,
      feoc_compliant: false,
    });
    expect(compliancePayloadFromForm({ cec_listed: true })).toEqual({
      cec_listed: true,
      feoc_compliant: false,
    });
  });

  it('maps URL slugs, keys, and labels', () => {
    expect(complianceUrlSlugToKey('cec-listed')).toBe('cec_listed');
    expect(complianceKeyToUrlSlug('feoc_compliant')).toBe('feoc-compliant');
    expect(complianceLabelForKey('cec_listed')).toBe('CEC Listed');
    expect(complianceLabelForKey('other')).toBe('other');
  });
});
