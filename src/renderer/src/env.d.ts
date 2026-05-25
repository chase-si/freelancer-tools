import type { FreelancerToolsApi } from '../../preload'

declare global {
  interface Window {
    freelancerTools: FreelancerToolsApi
  }
}
