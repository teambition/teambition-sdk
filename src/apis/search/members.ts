import { Observable } from '../../rx'
import { UserId, TeamId, ProjectId, OrganizationId, GroupId } from 'teambition-types'
import { SDKFetch } from '../../SDKFetch'

/**
 * 后端从 members/search 接口正常返回的数据结构。
 */
export interface MembersSearchResponse {
  _id: UserId,
  name: string,
  avatarUrl: string,
  email: string
}

/**
 * 对应后端接口上的 _groupType (team|project|organization|group)。
 * 为避免与群组 "group" 发生混淆，这里改用 ScopeType，代表搜索的范围，
 * 一个团队，一个项目，一个企业，或一个群组。
 */
export enum ScopeType { Team, Project, Organization, Group }

type Scope = {
  id?: TeamId | ProjectId | OrganizationId | GroupId,
  type?: ScopeType
}

export const buildPath = (scope: Scope): string | null => {
  const suffix = 'members/search'

  if (scope.id === undefined && scope.type === undefined) {
    return suffix
  }

  if (scope.id && scope.type != null) {
    const pathSegments = [suffix]
    const id = scope.id as string
    switch (scope.type) {
      case ScopeType.Team:
        pathSegments.unshift('teams', id)
        break
      case ScopeType.Project:
        pathSegments.unshift('projects', id)
        break
      case ScopeType.Organization:
        pathSegments.unshift('organizations', id)
        break
      case ScopeType.Group:
        pathSegments.unshift('groups', id)
        break
      default:
        return null
    }
    return pathSegments.join('/')
  } else {
    return null
  }
}

function fetch(this: SDKFetch, scope: Scope, searchString: string): Observable<MembersSearchResponse> {
  const path = buildPath(scope)
  if (!path) {
    throw `failed to build path for _groupType: ${scope.type} with _groupId: ${scope.id}`
  }
  return this.get<MembersSearchResponse>(path, { q: searchString })
}

export function searchMembersInTeam(this: SDKFetch, teamId: TeamId, searchString: string): Observable<MembersSearchResponse> {
  const targetTeam: Scope = { id: teamId, type: ScopeType.Team }
  return fetch.call(this, targetTeam, searchString)
}

export function searchMembersInProject(this: SDKFetch, projectId: ProjectId, searchString: string): Observable<MembersSearchResponse> {
  const targetProject: Scope = { id: projectId, type: ScopeType.Project }
  return fetch.call(this, targetProject, searchString)
}

export function searchMembersInOrganization(this: SDKFetch, orgId: OrganizationId, searchString: string): Observable<MembersSearchResponse> {
  const targetOrg: Scope = { id: orgId, type: ScopeType.Organization }
  return fetch.call(this, targetOrg, searchString)
}

export function searchMembersInGroup(this: SDKFetch, groupId: GroupId, searchString: string): Observable<MembersSearchResponse> {
  const targetGroup: Scope = { id: groupId, type: ScopeType.Group }
  return fetch.call(this, targetGroup, searchString)
}

export function searchMembers(this: SDKFetch, searchString: string): Observable<MembersSearchResponse> {
  return fetch.call(this, {}, searchString)
}

SDKFetch.prototype.searchMembersInTeam = searchMembersInTeam
SDKFetch.prototype.searchMembersInProject = searchMembersInProject
SDKFetch.prototype.searchMembersInOrganization = searchMembersInOrganization
SDKFetch.prototype.searchMembersInGroup = searchMembersInGroup
SDKFetch.prototype.searchMembers = searchMembers

declare module '../../SDKFetch' {
  interface SDKFetch {
    searchMembersInTeam: typeof searchMembersInTeam,
    searchMembersInProject: typeof searchMembersInProject,
    searchMembersInOrganization: typeof searchMembersInOrganization,
    searchMembersInGroup: typeof searchMembersInGroup,
    searchMembers: typeof searchMembers
  }
}
