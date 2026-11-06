export const COMPLIANCE_OPTIONS = [
  {
    key: 'cec_listed',
    label: 'CEC Listed',
    description: 'California Energy Commission Listed',
    urlSlug: 'cec-listed',
  },
  {
    key: 'feoc_compliant',
    label: 'FEOC Compliant',
    description: 'Foreign Entity of Concern Compliant',
    urlSlug: 'feoc-compliant',
  },
] as const;

export interface ComplianceFlags {
  cec_listed: boolean;
  feoc_compliant: boolean;
}

export interface ComplianceSource {
  cec_listed?: unknown;
  cecListed?: unknown;
  feoc_compliant?: unknown;
  feocCompliant?: unknown;
}

export function isComplianceTrue(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true';
}

export function complianceFlagsFromItem(item: ComplianceSource = {}): ComplianceFlags {
  return {
    cec_listed: isComplianceTrue(item.cec_listed ?? item.cecListed),
    feoc_compliant: isComplianceTrue(item.feoc_compliant ?? item.feocCompliant),
  };
}

export function complianceFormValuesFromData(data: ComplianceSource = {}): ComplianceFlags {
  return {
    cec_listed: isComplianceTrue(data.cec_listed),
    feoc_compliant: isComplianceTrue(data.feoc_compliant),
  };
}

export function compliancePayloadFromForm(values: Partial<ComplianceFlags> = {}): ComplianceFlags {
  return {
    cec_listed: values.cec_listed === true,
    feoc_compliant: values.feoc_compliant === true,
  };
}

export function complianceUrlSlugToKey(slug: string): string {
  const match = COMPLIANCE_OPTIONS.find((item) => item.urlSlug === slug || item.key === slug);
  return match ? match.key : slug;
}

export function complianceKeyToUrlSlug(key: string): string {
  const match = COMPLIANCE_OPTIONS.find((item) => item.key === key || item.urlSlug === key);
  return match ? match.urlSlug : key;
}

export function complianceLabelForKey(key: string): string {
  const match = COMPLIANCE_OPTIONS.find((item) => item.key === key || item.urlSlug === key);
  return match ? match.label : key;
}
