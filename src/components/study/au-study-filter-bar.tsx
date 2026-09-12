"use client"

import { useMemo, useState } from 'react'
import { STUDY_CATEGORIES, STUDY_CONCEPTS } from '@/data/study-concepts'
import { IconPicker, type PickerOption } from '@/components/ui/icon-picker'
import { getStudyCategoryVisual } from '@/components/ui/au-career-category-visuals'
import { useRouter } from 'next/navigation'
import { localizePath } from '@/lib/i18n/config'
import { useRouteLocale } from '@/lib/i18n/locale-provider'
import { useRouteTranslations } from '@/lib/i18n/use-translations'

type StudyLevel = 'all' | 'vocational' | 'bachelor' | 'postgraduate'
type FilterValues = { field: string; category: string; state: string; level: StudyLevel }

const AU_STATES = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'] as const
export function AuStudyFilterBar({ initialValues }: { initialValues: FilterValues }) {
  const router = useRouter()
  const locale = useRouteLocale()
  const t = useRouteTranslations().australia.study.filters
  const [category, setCategory] = useState(initialValues.category)
  const [subject, setSubject] = useState(() => findSubjectId(initialValues.field))
  const [state, setState] = useState(initialValues.state)
  const [level, setLevel] = useState<StudyLevel>(initialValues.level)

  const categoryOptions = useMemo<PickerOption[]>(() => [
    { value: '', label: t.allCategories, description: t.allCategoriesDescription, icon: '✨', keywords: 'all categories' },
    ...STUDY_CATEGORIES.map((item) => {
      const visual = getStudyCategoryVisual(item.id)
      const label = locale === 'ko' ? item.labelKo : item.label
      return { value: item.id, label, description: format(t.categoryDescription, { category: label }), icon: '', iconComponent: visual.Icon, iconTone: visual.tone, keywords: `${item.id} ${item.label} ${item.labelKo}` }
    }),
  ], [locale, t])
  const stateOptions = useMemo<PickerOption[]>(() => [
    { value: 'ALL_STATES', label: t.allStates, description: t.allStatesDescription, icon: '🇦🇺', keywords: 'australia all' },
    ...AU_STATES.map((item) => ({ value: item, label: item, description: format(t.stateDescription, { state: item }), icon: '📍', keywords: item })),
  ], [t])
  const subjectOptions = useMemo<PickerOption[]>(() => [
    { value: '', label: t.allSubjects, description: '', icon: '✨', keywords: 'all subjects majors' },
    ...STUDY_CONCEPTS
      .filter((concept) => !category || concept.category === category)
      .map((concept) => {
        const visual = getStudyCategoryVisual(concept.category)
        const label = locale === 'ko' ? concept.labelKo : concept.label
        return {
          value: concept.id,
          label,
          description: '',
          icon: '',
          iconComponent: visual.Icon,
          iconTone: visual.tone,
          keywords: `${concept.id} ${concept.label} ${concept.labelKo} ${concept.roiSearchTerm} ${concept.aliases.join(' ')} ${concept.aliasesKo.join(' ')}`,
        }
      }),
  ], [category, locale, t.allSubjects])
  const levelOptions = useMemo<PickerOption[]>(() => Object.entries({
    all: { label: t.allLevels, icon: '✨' },
    vocational: { label: t.certificateDiploma, icon: '🪪' },
    bachelor: { label: t.bachelor, icon: '🎓' },
    postgraduate: { label: t.postgraduate, icon: '📚' },
  } satisfies Record<StudyLevel, { label: string; icon: string }>).map(([value, item]) => ({
    value,
    label: item.label,
    description: value === 'all' ? t.allLevelsDescription : format(t.showLevel, { level: item.label }),
    icon: item.icon,
    keywords: `${value} ${item.label}`,
  })), [t])
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = new URLSearchParams()
    const selectedSubject = STUDY_CONCEPTS.find((concept) => concept.id === subject)
    if (selectedSubject) query.set('field', selectedSubject.roiSearchTerm)
    if (category) query.set('category', category)
    if (state !== 'ALL_STATES') query.set('state', state)
    if (level !== 'all') query.set('level', level)
    router.push(`${localizePath('/au/study', locale)}${query.size ? `?${query}` : ''}`)
  }

  return <form onSubmit={submit} className="max-w-4xl rounded-3xl border border-slate-200/90 bg-white p-2.5 shadow-[0_18px_45px_rgba(15,23,42,.10)] sm:p-3">
    <div className="grid gap-1.5 md:grid-cols-2">
      <div className="min-w-0"><IconPicker name="category" label={t.majorCategory} value={category} options={categoryOptions} onChange={(value) => { setCategory(value); if (subject && value && STUDY_CONCEPTS.find((concept) => concept.id === subject)?.category !== value) setSubject('') }} searchPlaceholder={t.searchCategories} testId="au-study-category" /></div>
      <div className="min-w-0"><IconPicker name="subject" label={t.subject} value={subject} options={subjectOptions} onChange={setSubject} testId="au-study-subject" /></div>
      <div className="min-w-0"><IconPicker name="level" label={t.studyLevel} value={level} options={levelOptions} onChange={(value) => setLevel(value as StudyLevel)} searchPlaceholder={t.searchLevels} testId="au-study-level" /></div>
      <div className="min-w-0"><IconPicker name="state" label={t.state} value={state} options={stateOptions} onChange={setState} searchPlaceholder={t.searchStates} testId="au-study-state" /></div>
    </div>
    <div className="mt-2 flex justify-end px-1"><button className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2">{t.search}</button></div>
  </form>
}

function findSubjectId(field: string) {
  const normalizedField = field.trim().toLocaleLowerCase()
  if (!normalizedField) return ''
  return STUDY_CONCEPTS.find((concept) => [concept.roiSearchTerm, concept.label, concept.labelKo, ...concept.aliases, ...concept.aliasesKo]
    .some((value) => value.toLocaleLowerCase() === normalizedField))?.id ?? ''
}

function format(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''))
}
