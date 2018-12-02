# Governance

This repo will describe how [**@remarkjs**](https://github.com/remarkjs) is
governed.
We’re currently drafting that out in [unifiedjs/governance#2](https://github.com/unifiedjs/governance/issues/2).

There’s a lot of churn around handling 200 projects with many different teams.
I’m going to try and write some code to streamline that here.

<!-- members start -->

## Members

*   John Otander
    ([**@johno**](https://github.com/johno))
    &lt;[johnotander@gmail.com](mailto:johnotander@gmail.com)>
*   Nikita Sobolev
    ([**@sobolevn**](https://github.com/sobolevn))
    &lt;[mail@sobolevn.me](mailto:mail@sobolevn.me)>
*   Titus Wormer
    ([**@wooorm**](https://github.com/wooorm))
    &lt;[tituswormer@gmail.com](mailto:tituswormer@gmail.com)>
    (**lead**)
*   Victor Felder
    ([**@vhf**](https://github.com/vhf))
    &lt;[victor@draft.li](mailto:victor@draft.li)>

<!-- members end -->

## Working

This repository houses a script (`script/github-teams.js`) that cleans the
GitHub organisation.

It sets up four teams and syncs all repos and humans under the organisation
with them:

*   A main team, **members**, that governs all repositories under the
    organisation with **read** access.
    All humans are invited to this team as **member**s.
    Humans with a `release` role are invited to this team as **maintainer**s.
*   An **emeriti** team, that governs all repositories under the organisation
    with **read** access.
    Humans with an `emeritus` role are invited to this team as **member**s.
    Humans with a `release` role are invited to this team as **maintainer**s.
*   A **mergers** team, that governs all repositories under the organisation
    with **write** access.
    Humans with a `merge` role are invited to this team as **member**s.
    Humans with a `release` role are invited to this team as **maintainer**s.
*   A **release** team, that governs all repositories under the organisation
    with **admin** access.
    Humans with a `release` role are invited to this team as **member**s.
    Humans with a `lead` role are invited to this team as **maintainer**s.

People on these teams that shouldn’t be there, are warned about or updated.

Additionally, it checks all members of the organisation.
It warns about people not on teams warned about and people without 2fa turned
on.
Someone with admin rights should contact these people about their removal, and
remove them.

Finally, it checks all repositories, checking that only outside collaborators
defined in `collaborators.json` have write rights.
Someone with admin rights should contact these people about their removal, and
remove them.
