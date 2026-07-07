import { MemberDetailView } from "@/components/members/member-detail-view";

type PageProps = {
  params: Promise<{ memberId: string }>;
};

export default async function MemberDetailPage({ params }: PageProps) {
  const { memberId } = await params;
  return <MemberDetailView memberId={Number(memberId)} />;
}
