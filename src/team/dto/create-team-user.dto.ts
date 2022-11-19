import { IsOptional } from "class-validator";
import { User } from "../../user/entities/user.entity";
import { Team } from "../entities/team.entity";

export class CreateTeamUserDto {
  @IsOptional()
  id?: number;

  @IsOptional()
  sport: string;

  @IsOptional()
  isConfirmed: boolean;

  @IsOptional()
  player: User;

  @IsOptional()
  playerId: number;

  @IsOptional()
  team: Team;

  @IsOptional()
  teamId: number;
}
