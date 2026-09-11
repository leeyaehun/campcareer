delete from public.country_occupation_links
where profile_key in ('NZ:early-childhood-teacher','NZ:primary-school-teacher','NZ:secondary-school-teacher','NZ:special-education-teacher')
  and link_type='source'
  and url='https://teachingcouncil.nz/index.htm/become-a-teacher/based-in-aotearoa-new-zealand/register-to-teach';

delete from public.country_occupation_links
where profile_key='NZ:special-education-teacher'
  and link_type='entry_program'
  and url='https://teachingcouncil.nz/en/become-a-teacher';;
